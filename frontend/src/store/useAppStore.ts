import { create } from 'zustand';
import {
  Pet,
  Vaccination,
  WeightRecord,
  MedicalDocument,
  HealthTimelineEntry,
  Appointment,
  Clinic,
  AuthUser,
  UserPreferences,
  ThemePreference,
} from '../types';
import { apiRequest, apiUpload } from '../lib/api';
import { StorageKeys, readJson, readString, writeJson, writeString, clearAccountData } from '../lib/storage';
import {
  mapBackendPet,
  mapBackendVaccination,
  mapBackendWeightRecord,
  mapBackendAppointment,
  mapBackendDocument,
  mapBackendClinic,
} from '../lib/adapters';

type VaccinationInput = {
  vaccineName: string;
  administrationDate: string;
  nextDueDate: string;
  veterinarian?: string;
  clinic?: string;
  batchNumber?: string;
};

type AppointmentInput = {
  pet: string;
  clinicName: string;
  clinicAddress?: string;
  date: string;
  reason?: string;
  notes?: string;
};

interface AppState {
  // Auth
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => void;
  clearAuthError: () => void;

  // Account settings
  fetchMe: () => Promise<void>;
  updateProfile: (input: { name?: string; preferences?: Partial<UserPreferences> }) => Promise<void>;
  changePassword: (currentPassword: string | undefined, newPassword: string) => Promise<void>;
  deleteAccount: (confirmEmail: string) => Promise<void>;

  // Theme — `theme` is what's applied; `themePreference` may be 'system' (follow the OS)
  theme: 'light' | 'dark';
  themePreference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setThemePreference: (pref: ThemePreference) => void;

  // Pets — real backend data
  pets: Pet[];
  petsLoading: boolean;
  petsError: string | null;
  selectedPetId: string;
  setSelectedPetId: (id: string) => void;
  selectedPet: () => Pet | null;
  fetchPets: () => Promise<void>;
  createPet: (input: { name: string; species: 'dog' | 'cat' | 'other'; breed?: string; gender?: 'male' | 'female'; dateOfBirth?: string }) => Promise<void>;
  updatePet: (petId: string, input: {
    name?: string;
    species?: string;
    breed?: string;
    gender?: string;
    dateOfBirth?: string;
    allergies?: string[];
    medications?: string[];
    microchipId?: string;
    emergencyContacts?: { name: string; phone: string }[];
  }) => Promise<void>;
  uploadPetPhoto: (petId: string, file: File) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;

  // Vaccinations — real backend data
  vaccinations: Vaccination[];
  vaccinationsLoading: boolean;
  fetchVaccinationsForPets: (petIds: string[]) => Promise<void>;
  addVaccination: (petId: string, input: VaccinationInput) => Promise<void>;
  updateVaccination: (id: string, input: Partial<VaccinationInput>) => Promise<void>;
  deleteVaccination: (id: string) => Promise<void>;

  // Weight records — real backend data
  weightRecords: Record<string, WeightRecord[]>;
  weightsLoading: boolean;
  fetchWeightsForPets: (petIds: string[]) => Promise<void>;
  addWeightRecord: (petId: string, weightKg: number) => Promise<void>;
  updateWeightRecord: (petId: string, id: string, input: { weightKg?: number; recordedAt?: string }) => Promise<void>;
  deleteWeightRecord: (petId: string, id: string) => Promise<void>;

  // Appointments — real backend data
  appointments: Appointment[];
  appointmentsLoading: boolean;
  fetchAppointments: () => Promise<void>;
  bookAppointment: (input: AppointmentInput) => Promise<void>;
  updateAppointment: (id: string, input: Partial<AppointmentInput> & { status?: 'scheduled' | 'completed' | 'cancelled' }) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Documents — real backend data
  documents: MedicalDocument[];
  documentsLoading: boolean;
  fetchDocumentsForPets: (petIds: string[]) => Promise<void>;
  uploadDocument: (petId: string, file: File, category: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Health Timeline — synthesized from real data
  timeline: HealthTimelineEntry[];

  // Clinics — real backend data (GET /clinics/nearby)
  clinics: Clinic[];
  clinicsLoading: boolean;
  clinicsError: string | null;
  fetchClinics: (lat?: number, lng?: number) => Promise<void>;
  favoriteClinicIds: string[];
  toggleFavoriteClinic: (id: string) => void;

  // Toasts
  toastMessage: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const getInitialThemePreference = (): ThemePreference => {
  if (typeof window !== 'undefined') {
    const saved = readString(StorageKeys.theme);
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
  }
  // No saved choice yet — follow the operating system
  return 'system';
};

const resolveTheme = (pref: ThemePreference): 'light' | 'dark' =>
  pref === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : pref;

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', theme === 'dark');
};

const getStoredAuth = (): { user: AuthUser | null; token: string | null } => ({
  token: readString(StorageKeys.token),
  user: readJson<AuthUser | null>(StorageKeys.user, null),
});

const saveSession = (token: string, user: AuthUser) => {
  writeString(StorageKeys.token, token);
  writeJson(StorageKeys.user, user);
};

// Last records fetched from the API, so a refresh shows the dashboard instantly
// while fresh data loads. Tagged with the user id so one account's cache is
// never shown to another; cleared on logout.
type RecordsCache = {
  userId: string;
  savedAt: string;
  pets: Pet[];
  vaccinations: Vaccination[];
  weightRecords: Record<string, WeightRecord[]>;
  appointments: Appointment[];
  documents: MedicalDocument[];
};
const RECORDS_CACHE_VERSION = 1;

const getCachedRecords = (userId: string | undefined): Omit<RecordsCache, 'userId' | 'savedAt'> | null => {
  const cache = readJson<(RecordsCache & { v?: number }) | null>(StorageKeys.recordsCache, null);
  if (!cache || !userId || cache.userId !== userId || cache.v !== RECORDS_CACHE_VERSION) return null;
  return {
    pets: cache.pets ?? [],
    vaccinations: cache.vaccinations ?? [],
    weightRecords: cache.weightRecords ?? {},
    appointments: cache.appointments ?? [],
    documents: cache.documents ?? [],
  };
};

/** Build a chronological timeline feed from real vaccination/weight/appointment/document data */
function buildTimeline({ vaccinations, weightRecords, appointments, documents }: {
  vaccinations: Vaccination[];
  weightRecords: Record<string, WeightRecord[]>;
  appointments: Appointment[];
  documents: MedicalDocument[];
}): HealthTimelineEntry[] {
  const entries: HealthTimelineEntry[] = [];

  for (const vac of vaccinations) {
    const date = vac.administeredDate || vac.nextDueDate;
    entries.push({
      id: `tl-vac-${vac.id}`,
      petId: vac.petId,
      title: `${vac.name} Vaccination`,
      category: 'vaccination',
      date,
      sortDate: date,
      description: `Administered at ${vac.clinic} by ${vac.veterinarian}. Next due: ${vac.nextDueDate}.`,
    });
  }

  for (const records of Object.values(weightRecords)) {
    for (const w of records) {
      entries.push({
        id: `tl-weight-${w.id}`,
        petId: w.petId,
        title: `Weight Logged: ${w.weight} kg`,
        category: 'weight',
        date: w.date,
        sortDate: w.recordedAt,
        description: w.trendPercent !== null
          ? `${w.trendPercent > 0 ? '+' : ''}${w.trendPercent}% since the previous weigh-in`
          : `Recorded ${w.weight} kg`,
      });
    }
  }

  for (const apt of appointments) {
    const label = apt.status === 'cancelled' ? 'Cancelled' : apt.status === 'completed' ? 'Completed' : 'Upcoming';
    entries.push({
      id: `tl-apt-${apt.id}`,
      petId: apt.petId,
      title: `${label} Appointment: ${apt.reason}`,
      category: 'appointment',
      date: apt.date,
      sortDate: apt.dateISO,
      description: `${apt.clinicName}${apt.notes ? ` · ${apt.notes}` : ''}`,
    });
  }

  for (const doc of documents) {
    entries.push({
      id: `tl-doc-${doc.id}`,
      petId: doc.petId,
      title: `${doc.category} added`,
      category: 'document',
      date: doc.date,
      sortDate: doc.uploadedAt,
      description: doc.title,
    });
  }

  // Most recent first — compared as timestamps, since display dates aren't sortable strings
  const time = (iso: string) => new Date(iso).getTime() || 0;
  entries.sort((a, b) => time(b.sortDate) - time(a.sortDate));
  return entries;
}

// ── store ─────────────────────────────────────────────────────────────────────

const { user: storedUser, token: storedToken } = getStoredAuth();
const initialThemePreference = getInitialThemePreference();
const cachedRecords = storedToken ? getCachedRecords(storedUser?.id) : null;

export const useAppStore = create<AppState>((set, get) => {
  // Recompute the timeline after any record change
  const refreshTimeline = () => {
    const { vaccinations, weightRecords, appointments, documents } = get();
    set({ timeline: buildTimeline({ vaccinations, weightRecords, appointments, documents }) });
  };

  const requireToken = () => {
    const { token } = get();
    if (!token) throw new Error('Not logged in');
    return token;
  };

  const startSession = async (token: string, user: AuthUser) => {
    saveSession(token, user);
    set({ user, token, isAuthenticated: true, authLoading: false });
    await get().fetchPets();
  };

  return {
    // ── Auth ──
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
    authLoading: false,
    authError: null,

    login: async (email, password) => {
      set({ authLoading: true, authError: null });
      try {
        const data = await apiRequest<{ token: string; user: AuthUser }>('/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        await startSession(data.token, data.user);
      } catch (err: unknown) {
        const raw = err instanceof Error ? err.message : 'Login failed';
        // Surface a friendly message in the auth error banner
        const msg = raw.toLowerCase().includes('invalid') || raw.toLowerCase().includes('credentials')
          ? 'Incorrect email or password — please try again.'
          : raw.toLowerCase().includes('not found') || raw.toLowerCase().includes('no user')
            ? 'No account found with that email. Create one below!'
            : raw;
        set({ authError: msg, authLoading: false });
        throw err;
      }
    },

    signup: async (name, email, password) => {
      set({ authLoading: true, authError: null });
      try {
        const data = await apiRequest<{ token: string; user: AuthUser }>('/auth/register', {
          method: 'POST',
          body: { name, email, password },
        });
        await startSession(data.token, data.user);
      } catch (err: unknown) {
        const raw = err instanceof Error ? err.message : 'Sign up failed';
        const msg = raw.toLowerCase().includes('already') || raw.toLowerCase().includes('duplicate') || raw.toLowerCase().includes('exists')
          ? 'An account with that email already exists. Try logging in instead.'
          : raw;
        set({ authError: msg, authLoading: false });
        throw err;
      }
    },

    googleLogin: async (idToken) => {
      set({ authLoading: true, authError: null });
      try {
        const data = await apiRequest<{ token: string; user: AuthUser }>('/auth/google', {
          method: 'POST',
          body: { idToken },
        });
        await startSession(data.token, data.user);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Google sign-in failed';
        set({ authError: msg, authLoading: false });
        throw err;
      }
    },

    logout: () => {
      clearAccountData();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        pets: [],
        vaccinations: [],
        weightRecords: {},
        appointments: [],
        documents: [],
        timeline: [],
        selectedPetId: '',
      });
    },

    clearAuthError: () => set({ authError: null }),

    // ── Account settings ──
    fetchMe: async () => {
      const { token } = get();
      if (!token) return;
      try {
        const user = await apiRequest<AuthUser>('/auth/me', { token });
        writeJson(StorageKeys.user, user);
        set({ user });
      } catch {
        // Non-fatal: the stored user stays in place (a 401 is handled by apiRequest)
      }
    },

    updateProfile: async (input) => {
      const token = requireToken();
      const user = await apiRequest<AuthUser>('/auth/me', { method: 'PUT', token, body: input });
      writeJson(StorageKeys.user, user);
      set({ user });
    },

    changePassword: async (currentPassword, newPassword) => {
      const token = requireToken();
      const user = await apiRequest<AuthUser>('/auth/password', {
        method: 'PUT',
        token,
        body: { currentPassword, newPassword },
      });
      writeJson(StorageKeys.user, user);
      set({ user });
    },

    deleteAccount: async (confirmEmail) => {
      const token = requireToken();
      await apiRequest('/auth/me', { method: 'DELETE', token, body: { confirmEmail } });
      get().logout();
    },

    // ── Theme ──
    theme: resolveTheme(initialThemePreference),
    themePreference: initialThemePreference,
    toggleTheme: () => get().setTheme(get().theme === 'light' ? 'dark' : 'light'),
    setTheme: (theme) => get().setThemePreference(theme),
    setThemePreference: (pref) => {
      writeString(StorageKeys.theme, pref);
      const theme = resolveTheme(pref);
      applyTheme(theme);
      set({ themePreference: pref, theme });
    },

    // ── Pets (real backend data) ──
    pets: cachedRecords?.pets ?? [],
    petsLoading: false,
    petsError: null,
    // Reopen on the pet the user was last viewing
    selectedPetId: readString(StorageKeys.selectedPet) || '',
    setSelectedPetId: (id) => set({ selectedPetId: id }),
    selectedPet: () => {
      const { pets, selectedPetId } = get();
      if (pets.length === 0) return null;
      return pets.find((p) => p.id === selectedPetId) || pets[0];
    },

    fetchPets: async () => {
      const { token } = get();
      if (!token) return;
      set({ petsLoading: true, petsError: null });
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const backendPets = await apiRequest<any[]>('/pets', { token });
        const pets = backendPets.map(mapBackendPet);
        const currentSelected = get().selectedPetId;
        const stillExists = pets.some((p) => p.id === currentSelected);
        set({
          pets,
          petsLoading: false,
          selectedPetId: stillExists ? currentSelected : pets[0]?.id || '',
        });

        if (pets.length > 0) {
          const petIds = pets.map((p) => p.id);
          // Fetch all related data in parallel — failures are non-fatal
          await Promise.allSettled([
            get().fetchVaccinationsForPets(petIds),
            get().fetchWeightsForPets(petIds),
            get().fetchAppointments(),
            get().fetchDocumentsForPets(petIds),
          ]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not load pets';
        set({ petsLoading: false, petsError: msg });
      }
    },

    createPet: async (input) => {
      const token = requireToken();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendPet = await apiRequest<any>('/pets', {
        method: 'POST',
        token,
        body: input,
      });
      const pet = mapBackendPet(backendPet);
      set((state) => ({ pets: [...state.pets, pet], selectedPetId: pet.id }));
      get().showToast(`🐾 ${pet.name}'s profile is ready! Start logging vaccinations and checkups.`);
    },

    updatePet: async (petId, input) => {
      const token = requireToken();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendPet = await apiRequest<any>(`/pets/${petId}`, {
        method: 'PUT',
        token,
        body: input,
      });
      const updated = mapBackendPet(backendPet);
      // Preserve current weight (fetched separately via WeightRecord)
      const currentWeight = get().weightRecords[petId];
      if (currentWeight?.length) updated.weight = currentWeight[currentWeight.length - 1].weight;
      set((state) => ({ pets: state.pets.map((p) => (p.id === petId ? { ...updated } : p)) }));
      get().showToast(`✅ ${updated.name}'s profile updated successfully.`);
    },

    uploadPetPhoto: async (petId, file) => {
      const token = requireToken();
      const formData = new FormData();
      formData.append('photo', file);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendPet = await apiUpload<any>(`/pets/${petId}/photo`, formData, token);
      const updated = mapBackendPet(backendPet);
      set((state) => ({
        pets: state.pets.map((p) => (p.id === petId ? { ...p, photo: updated.photo, hasCustomPhoto: true } : p)),
      }));
      get().showToast(`📸 New photo saved for ${updated.name}!`);
    },

    deletePet: async (petId) => {
      const token = requireToken();
      await apiRequest(`/pets/${petId}`, { method: 'DELETE', token });
      // The backend also removed this pet's records, so drop them locally too
      set((state) => {
        const remaining = state.pets.filter((p) => p.id !== petId);
        const { [petId]: _removed, ...weightRecords } = state.weightRecords;
        return {
          pets: remaining,
          selectedPetId: remaining[0]?.id || '',
          vaccinations: state.vaccinations.filter((v) => v.petId !== petId),
          appointments: state.appointments.filter((a) => a.petId !== petId),
          documents: state.documents.filter((d) => d.petId !== petId),
          weightRecords,
        };
      });
      refreshTimeline();
      get().showToast('Pet profile deleted.');
    },

    // ── Vaccinations (real backend data) ──
    vaccinations: cachedRecords?.vaccinations ?? [],
    vaccinationsLoading: false,

    fetchVaccinationsForPets: async (petIds) => {
      const { token } = get();
      if (!token || petIds.length === 0) return;
      set({ vaccinationsLoading: true });
      try {
        const results = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          petIds.map((petId) => apiRequest<any[]>(`/pets/${petId}/vaccinations`, { token }))
        );
        set({ vaccinations: results.flat().map(mapBackendVaccination), vaccinationsLoading: false });
        refreshTimeline();
      } catch {
        set({ vaccinationsLoading: false });
      }
    },

    addVaccination: async (petId, input) => {
      const token = requireToken();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bv = await apiRequest<any>(`/pets/${petId}/vaccinations`, {
        method: 'POST',
        token,
        body: input,
      });
      const vac = mapBackendVaccination(bv);
      set((state) => ({ vaccinations: [vac, ...state.vaccinations] }));
      refreshTimeline();
      get().showToast(`💉 Vaccination "${vac.name}" recorded — next due ${vac.nextDueDate}.`);
    },

    updateVaccination: async (id, input) => {
      const token = requireToken();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bv = await apiRequest<any>(`/vaccinations/${id}`, { method: 'PUT', token, body: input });
      const vac = mapBackendVaccination(bv);
      set((state) => ({ vaccinations: state.vaccinations.map((v) => (v.id === id ? vac : v)) }));
      refreshTimeline();
      get().showToast(`✅ "${vac.name}" updated.`);
    },

    deleteVaccination: async (id) => {
      const token = requireToken();
      await apiRequest(`/vaccinations/${id}`, { method: 'DELETE', token });
      set((state) => ({ vaccinations: state.vaccinations.filter((v) => v.id !== id) }));
      refreshTimeline();
      get().showToast('Vaccination record deleted.');
    },

    // ── Weight Records (real backend data) ──
    weightRecords: cachedRecords?.weightRecords ?? {},
    weightsLoading: false,

    fetchWeightsForPets: async (petIds) => {
      const { token } = get();
      if (!token || petIds.length === 0) return;
      set({ weightsLoading: true });
      try {
        const results = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          petIds.map((petId) => apiRequest<any[]>(`/pets/${petId}/weights`, { token }).then((recs) => ({ petId, recs })))
        );
        const fetched: Record<string, WeightRecord[]> = {};
        for (const { petId, recs } of results) {
          fetched[petId] = recs.map(mapBackendWeightRecord);
        }
        // Merge so refetching one pet doesn't wipe the others; update each
        // pet's displayed weight from its latest record
        set((state) => {
          const weightRecords = { ...state.weightRecords, ...fetched };
          const updatedPets = state.pets.map((p) => {
            if (!fetched[p.id]) return p;
            const records = fetched[p.id];
            return { ...p, weight: records.length ? records[records.length - 1].weight : 0 };
          });
          return { weightRecords, weightsLoading: false, pets: updatedPets };
        });
        refreshTimeline();
      } catch {
        set({ weightsLoading: false });
      }
    },

    addWeightRecord: async (petId, weightKg) => {
      const token = requireToken();
      await apiRequest(`/pets/${petId}/weights`, {
        method: 'POST',
        token,
        body: { weightKg, recordedAt: new Date().toISOString() },
      });
      // Refetch so the backend-computed trend % is included for the new entry
      await get().fetchWeightsForPets([petId]);
      const petName = get().pets.find((p) => p.id === petId)?.name || 'your pet';
      get().showToast(`⚖️ Logged ${weightKg} kg for ${petName}. Chart updated!`);
    },

    updateWeightRecord: async (petId, id, input) => {
      const token = requireToken();
      await apiRequest(`/weights/${id}`, { method: 'PUT', token, body: input });
      // Trends and ordering depend on neighbouring entries, so refetch this pet's list
      await get().fetchWeightsForPets([petId]);
      get().showToast('✅ Weigh-in updated.');
    },

    deleteWeightRecord: async (petId, id) => {
      const token = requireToken();
      await apiRequest(`/weights/${id}`, { method: 'DELETE', token });
      await get().fetchWeightsForPets([petId]);
      get().showToast('Weigh-in deleted.');
    },

    // ── Appointments (real backend data) ──
    appointments: cachedRecords?.appointments ?? [],
    appointmentsLoading: false,

    fetchAppointments: async () => {
      const { token } = get();
      if (!token) return;
      set({ appointmentsLoading: true });
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await apiRequest<any[]>('/appointments', { token });
        set({ appointments: raw.map(mapBackendAppointment), appointmentsLoading: false });
        refreshTimeline();
      } catch {
        set({ appointmentsLoading: false });
      }
    },

    bookAppointment: async (input) => {
      const token = requireToken();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ba = await apiRequest<any>('/appointments', {
        method: 'POST',
        token,
        body: {
          pet: input.pet,
          clinic: { name: input.clinicName, address: input.clinicAddress || '' },
          date: new Date(input.date).toISOString(),
          reason: input.reason,
          notes: input.notes,
        },
      });
      const apt = mapBackendAppointment(ba);
      set((state) => ({ appointments: [apt, ...state.appointments] }));
      refreshTimeline();
      get().showToast(`📅 Appointment confirmed at ${input.clinicName}. We'll remind you before it's due!`);
    },

    updateAppointment: async (id, input) => {
      const token = requireToken();
      const body: Record<string, unknown> = {};
      if (input.pet !== undefined) body.pet = input.pet;
      if (input.clinicName !== undefined) body.clinic = { name: input.clinicName, address: input.clinicAddress || '' };
      if (input.date !== undefined) body.date = new Date(input.date).toISOString();
      if (input.reason !== undefined) body.reason = input.reason;
      if (input.notes !== undefined) body.notes = input.notes;
      if (input.status !== undefined) body.status = input.status;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ba = await apiRequest<any>(`/appointments/${id}`, { method: 'PUT', token, body });
      const apt = mapBackendAppointment(ba);
      set((state) => ({ appointments: state.appointments.map((a) => (a.id === id ? apt : a)) }));
      refreshTimeline();
      get().showToast(
        input.status === 'cancelled' ? 'Appointment cancelled.'
          : input.status === 'completed' ? '✅ Appointment marked as completed.'
            : '✅ Appointment updated.'
      );
    },

    deleteAppointment: async (id) => {
      const token = requireToken();
      await apiRequest(`/appointments/${id}`, { method: 'DELETE', token });
      set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }));
      refreshTimeline();
      get().showToast('Appointment deleted.');
    },

    // ── Documents (real backend data) ──
    documents: cachedRecords?.documents ?? [],
    documentsLoading: false,

    fetchDocumentsForPets: async (petIds) => {
      const { token } = get();
      if (!token || petIds.length === 0) return;
      set({ documentsLoading: true });
      try {
        const results = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          petIds.map((petId) => apiRequest<any[]>(`/pets/${petId}/documents`, { token }))
        );
        set({ documents: results.flat().map(mapBackendDocument), documentsLoading: false });
        refreshTimeline();
      } catch {
        set({ documentsLoading: false });
      }
    },

    uploadDocument: async (petId, file, category) => {
      const token = requireToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await apiUpload<any>(`/pets/${petId}/documents`, formData, token);
      const doc = mapBackendDocument(data);
      set((state) => ({ documents: [doc, ...state.documents] }));
      refreshTimeline();
      get().showToast(`📎 "${doc.title}" saved to the Medical Vault.`);
    },

    deleteDocument: async (id) => {
      const token = requireToken();
      await apiRequest(`/documents/${id}`, { method: 'DELETE', token });
      set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
      refreshTimeline();
      get().showToast('Document deleted from the vault.');
    },

    // ── Health Timeline (synthesized from real data) ──
    timeline: cachedRecords ? buildTimeline(cachedRecords) : [],

    // ── Clinics (real backend data) ──
    clinics: [],
    clinicsLoading: false,
    clinicsError: null,
    fetchClinics: async (lat, lng) => {
      const { token } = get();
      if (!token) return;
      set({ clinicsLoading: true, clinicsError: null });
      try {
        const query = lat !== undefined && lng !== undefined ? `?lat=${lat}&lng=${lng}` : '';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await apiRequest<any[]>(`/clinics/nearby${query}`, { token });
        const favorites = get().favoriteClinicIds;
        const clinics = raw.map(mapBackendClinic).map((c) => ({ ...c, isFavorite: favorites.includes(c.id) }));
        set({ clinics, clinicsLoading: false });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not load nearby clinics';
        set({ clinicsLoading: false, clinicsError: msg });
      }
    },

    // ── Clinic favorites (kept in this browser — no backend favorites endpoint yet) ──
    favoriteClinicIds: readJson<string[]>(StorageKeys.favoriteClinics, []),
    toggleFavoriteClinic: (id) => {
      const favorites = get().favoriteClinicIds;
      const exists = favorites.includes(id);
      const updated = exists ? favorites.filter((f) => f !== id) : [...favorites, id];
      writeJson(StorageKeys.favoriteClinics, updated);
      set((state) => ({
        favoriteClinicIds: updated,
        clinics: state.clinics.map((c) => (c.id === id ? { ...c, isFavorite: !exists } : c)),
      }));
      get().showToast(exists ? 'Clinic removed from your saved list.' : '⭐ Clinic saved to your favourites!');
    },

    // ── Toasts ──
    toastMessage: null,
    showToast: (msg) => {
      set({ toastMessage: msg });
      setTimeout(() => {
        if (get().toastMessage === msg) set({ toastMessage: null });
      }, 4000);
    },
    clearToast: () => set({ toastMessage: null }),
  };
});

// Save records and the selected pet whenever they change. Debounced so a burst
// of updates (e.g. the parallel fetches after login) is written once.
let cacheTimer: ReturnType<typeof setTimeout> | undefined;
useAppStore.subscribe((state, prev) => {
  if (state.selectedPetId !== prev.selectedPetId && state.selectedPetId) {
    writeString(StorageKeys.selectedPet, state.selectedPetId);
  }

  const recordsChanged = state.pets !== prev.pets || state.vaccinations !== prev.vaccinations
    || state.weightRecords !== prev.weightRecords || state.appointments !== prev.appointments
    || state.documents !== prev.documents;
  if (!recordsChanged || !state.isAuthenticated || !state.user) return;

  clearTimeout(cacheTimer);
  cacheTimer = setTimeout(() => {
    const { user, isAuthenticated, pets, vaccinations, weightRecords, appointments, documents } = useAppStore.getState();
    // Logged out while the timer was pending — don't write the old account back
    if (!isAuthenticated || !user) return;
    writeJson(StorageKeys.recordsCache, {
      v: RECORDS_CACHE_VERSION, userId: user.id, savedAt: new Date().toISOString(),
      pets, vaccinations, weightRecords, appointments, documents,
    });
  }, 300);
});

// Keep 'system' theme in sync when the OS switches between light and dark
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { themePreference, setThemePreference } = useAppStore.getState();
    if (themePreference === 'system') setThemePreference('system');
  });
}
