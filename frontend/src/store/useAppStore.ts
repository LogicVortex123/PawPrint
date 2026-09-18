import { create } from 'zustand';
import { MOCK_TIMELINE } from '../data/mockData';
import { Pet, Vaccination, WeightRecord, MedicalDocument, HealthTimelineEntry, Appointment, Clinic } from '../types';
import { apiRequest } from '../lib/api';
import {
  mapBackendPet,
  mapBackendVaccination,
  mapBackendWeightRecord,
  mapBackendAppointment,
  mapBackendDocument,
  mapBackendClinic,
} from '../lib/adapters';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  authProvider: string;
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

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

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
  deletePet: (petId: string) => Promise<void>;

  // Vaccinations — real backend data
  vaccinations: Vaccination[];
  vaccinationsLoading: boolean;
  fetchVaccinationsForPets: (petIds: string[]) => Promise<void>;
  addVaccination: (petId: string, input: {
    vaccineName: string;
    administrationDate: string;
    nextDueDate: string;
    veterinarian?: string;
    clinic?: string;
    batchNumber?: string;
  }) => Promise<void>;

  // Weight records — real backend data
  weightRecords: Record<string, WeightRecord[]>;
  weightsLoading: boolean;
  fetchWeightsForPets: (petIds: string[]) => Promise<void>;
  addWeightRecord: (petId: string, weightKg: number) => Promise<void>;

  // Appointments — real backend data
  appointments: Appointment[];
  appointmentsLoading: boolean;
  fetchAppointments: () => Promise<void>;
  bookAppointment: (input: {
    pet: string;
    clinicName: string;
    clinicAddress?: string;
    date: string;
    reason?: string;
    notes?: string;
  }) => Promise<void>;

  // Documents — real backend data
  documents: MedicalDocument[];
  documentsLoading: boolean;
  fetchDocumentsForPets: (petIds: string[]) => Promise<void>;
  uploadDocument: (petId: string, file: File, category: string) => Promise<void>;

  // Health Timeline — synthesized from real data
  timeline: HealthTimelineEntry[];

  // Offline simulation
  isOnline: boolean;
  pendingSyncCount: number;
  toggleNetworkSimulation: () => void;
  triggerMockSync: () => void;

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

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pawprint-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  }
  return 'light';
};

const getStoredAuth = (): { user: AuthUser | null; token: string | null } => {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const token = localStorage.getItem('pawprint-token');
    const raw = localStorage.getItem('pawprint-user');
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
};

/** Build a chronological timeline feed from real vaccination/weight/appointment data */
function buildTimeline(
  vaccinations: Vaccination[],
  weightRecords: Record<string, WeightRecord[]>,
  appointments: Appointment[]
): HealthTimelineEntry[] {
  const entries: HealthTimelineEntry[] = [];

  for (const vac of vaccinations) {
    entries.push({
      id: `tl-vac-${vac.id}`,
      petId: vac.petId,
      title: `${vac.name} Vaccination`,
      category: 'vaccination',
      date: vac.administeredDate || vac.nextDueDate,
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
        description: w.note || `Recorded ${w.weight} kg`,
      });
    }
  }

  for (const apt of appointments) {
    entries.push({
      id: `tl-apt-${apt.id}`,
      petId: apt.petId,
      title: `${apt.status === 'upcoming' ? 'Upcoming' : 'Past'} Appointment: ${apt.reason}`,
      category: 'appointment',
      date: apt.date,
      description: `${apt.clinicName}${apt.notes ? ` · ${apt.notes}` : ''}`,
    });
  }

  // Sort most recent first (simple string sort works for ISO dates and formatted dates)
  entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  return entries;
}

// ── store ─────────────────────────────────────────────────────────────────────

const { user: storedUser, token: storedToken } = getStoredAuth();

export const useAppStore = create<AppState>((set, get) => ({
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
      localStorage.setItem('pawprint-token', data.token);
      localStorage.setItem('pawprint-user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, authLoading: false });
      await get().fetchPets();
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
      localStorage.setItem('pawprint-token', data.token);
      localStorage.setItem('pawprint-user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, authLoading: false });
      await get().fetchPets();
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
      localStorage.setItem('pawprint-token', data.token);
      localStorage.setItem('pawprint-user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, authLoading: false });
      await get().fetchPets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      set({ authError: msg, authLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('pawprint-token');
    localStorage.removeItem('pawprint-user');
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

  // ── Theme ──
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      localStorage.setItem('pawprint-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
    }
    set({ theme: next });
  },
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pawprint-theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    set({ theme });
  },

  // ── Pets (real backend data) ──
  pets: [],
  petsLoading: false,
  petsError: null,
  selectedPetId: '',
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
    const { token } = get();
    if (!token) throw new Error('Not logged in');
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
    const { token } = get();
    if (!token) throw new Error('Not logged in');
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

  deletePet: async (petId) => {
    const { token, pets } = get();
    if (!token) throw new Error('Not logged in');
    await apiRequest(`/pets/${petId}`, { method: 'DELETE', token });
    const remaining = pets.filter((p) => p.id !== petId);
    set({
      pets: remaining,
      selectedPetId: remaining[0]?.id || '',
    });
    get().showToast('Pet profile deleted.');
  },

  // ── Vaccinations (real backend data) ──
  vaccinations: [],
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
      const vaccinations = results.flat().map(mapBackendVaccination);
      set({ vaccinations, vaccinationsLoading: false });
      // Rebuild timeline after vaccination data is available
      const { weightRecords, appointments } = get();
      set({ timeline: buildTimeline(vaccinations, weightRecords, appointments) });
    } catch {
      set({ vaccinationsLoading: false });
    }
  },

  addVaccination: async (petId, input) => {
    const { token } = get();
    if (!token) throw new Error('Not logged in');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bv = await apiRequest<any>(`/pets/${petId}/vaccinations`, {
      method: 'POST',
      token,
      body: input,
    });
    const vac = mapBackendVaccination(bv);
    set((state) => {
      const vaccinations = [vac, ...state.vaccinations];
      const { weightRecords, appointments } = state;
      return { vaccinations, timeline: buildTimeline(vaccinations, weightRecords, appointments) };
    });
    get().showToast(`💉 Vaccination "${vac.name}" recorded — next due ${vac.nextDueDate}.`);
  },

  // ── Weight Records (real backend data) ──
  weightRecords: {},
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
      const weightRecords: Record<string, WeightRecord[]> = {};
      for (const { petId, recs } of results) {
        weightRecords[petId] = recs.map(mapBackendWeightRecord);
      }
      // Update each pet's displayed weight from its latest record
      set((state) => {
        const updatedPets = state.pets.map((p) => {
          const records = weightRecords[p.id];
          if (!records || records.length === 0) return p;
          const latest = records[records.length - 1];
          return { ...p, weight: latest.weight };
        });
        return { weightRecords, weightsLoading: false, pets: updatedPets };
      });
      // Rebuild timeline
      const { vaccinations, appointments } = get();
      set({ timeline: buildTimeline(vaccinations, weightRecords, appointments) });
    } catch {
      set({ weightsLoading: false });
    }
  },

  addWeightRecord: async (petId, weightKg) => {
    const { token } = get();
    if (!token) throw new Error('Not logged in');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bw = await apiRequest<any>(`/pets/${petId}/weights`, {
      method: 'POST',
      token,
      body: { weightKg, recordedAt: new Date().toISOString() },
    });
    const record = mapBackendWeightRecord(bw);
    set((state) => {
      const existing = state.weightRecords[petId] || [];
      const weightRecords = { ...state.weightRecords, [petId]: [...existing, record] };
      // Update the pet's current weight
      const updatedPets = state.pets.map((p) =>
        p.id === petId ? { ...p, weight: record.weight } : p
      );
      const { vaccinations, appointments } = state;
      return {
        weightRecords,
        pets: updatedPets,
        timeline: buildTimeline(vaccinations, weightRecords, appointments),
      };
    });
    const petName = get().pets.find((p) => p.id === petId)?.name || 'your pet';
    get().showToast(`⚖️ Logged ${weightKg} kg for ${petName}. Chart updated!`);
  },

  // ── Appointments (real backend data) ──
  appointments: [],
  appointmentsLoading: false,

  fetchAppointments: async () => {
    const { token } = get();
    if (!token) return;
    set({ appointmentsLoading: true });
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await apiRequest<any[]>('/appointments', { token });
      const appointments = raw.map(mapBackendAppointment);
      set({ appointments, appointmentsLoading: false });
      const { vaccinations: v2, weightRecords: w2 } = get();
      set({ timeline: buildTimeline(v2, w2, appointments) });
    } catch {
      set({ appointmentsLoading: false });
    }
  },

  bookAppointment: async (input) => {
    const { token } = get();
    if (!token) throw new Error('Not logged in');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ba = await apiRequest<any>('/appointments', {
      method: 'POST',
      token,
      body: {
        pet: input.pet,
        clinic: { name: input.clinicName, address: input.clinicAddress || '' },
        date: input.date,
        reason: input.reason,
        notes: input.notes,
      },
    });
    const apt = mapBackendAppointment(ba);
    set((state) => {
      const appointments = [apt, ...state.appointments];
      const { vaccinations, weightRecords } = state;
      return { appointments, timeline: buildTimeline(vaccinations, weightRecords, appointments) };
    });
    get().showToast(`📅 Appointment confirmed at ${input.clinicName}. We'll remind you before it's due!`);
  },

  // ── Documents (real backend data) ──
  documents: [],
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
      const documents = results.flat().map(mapBackendDocument);
      set({ documents, documentsLoading: false });
    } catch {
      set({ documentsLoading: false });
    }
  },

  uploadDocument: async (petId, file, category) => {
    const { token } = get();
    if (!token) throw new Error('Not logged in');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    // Use raw fetch for multipart — apiRequest only handles JSON
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pets/${petId}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');

    const doc = mapBackendDocument(data);
    set((state) => ({ documents: [doc, ...state.documents] }));
    get().showToast(`📎 "${doc.title}" saved to the Medical Vault — accessible anytime, even offline.`);
  },

  // ── Health Timeline (synthesized from real data) ──
  timeline: MOCK_TIMELINE, // placeholder until real data arrives on login

  // ── Offline simulation ──
  isOnline: true,
  pendingSyncCount: 0,
  toggleNetworkSimulation: () => {
    const nextState = !get().isOnline;
    set({ isOnline: nextState });
    if (nextState && get().pendingSyncCount > 0) {
      get().triggerMockSync();
    } else {
      get().showToast(
        nextState
          ? 'Cloud connection restored — all changes synced. ✅'
          : '⚠️ Offline mode active — your changes are saved locally and will sync automatically when back online.'
      );
    }
  },
  triggerMockSync: () => {
    get().showToast(`ℹ️ Syncing ${get().pendingSyncCount || 1} pending record(s) to cloud…`);
    setTimeout(() => {
      set({ pendingSyncCount: 0 });
      get().showToast('All pet records are up to date. ✅');
    }, 1200);
  },

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

  // ── Clinic favorites (client-side only — no backend favorites endpoint yet) ──
  favoriteClinicIds: [],
  toggleFavoriteClinic: (id) => {
    const favorites = get().favoriteClinicIds;
    const exists = favorites.includes(id);
    const updated = exists ? favorites.filter((f) => f !== id) : [...favorites, id];
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
}));
