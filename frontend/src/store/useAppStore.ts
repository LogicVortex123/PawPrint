import { create } from 'zustand';
import { MOCK_PETS, MOCK_VACCINATIONS, MOCK_WEIGHT_HISTORY, MOCK_DOCUMENTS, MOCK_TIMELINE, MOCK_APPOINTMENTS } from '../data/mockData';
import { Pet, Vaccination, WeightRecord, MedicalDocument, HealthTimelineEntry, Appointment } from '../types';
import { apiRequest } from '../lib/api';

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
  logout: () => void;
  clearAuthError: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Selected Pet
  pets: Pet[];
  selectedPetId: string;
  setSelectedPetId: (id: string) => void;
  selectedPet: () => Pet;

  // Records
  vaccinations: Vaccination[];
  weightRecords: Record<string, WeightRecord[]>;
  appointments: Appointment[];
  documents: MedicalDocument[];
  timeline: HealthTimelineEntry[];

  // Offline simulation
  isOnline: boolean;
  pendingSyncCount: number;
  toggleNetworkSimulation: () => void;
  triggerMockSync: () => void;

  // Clinic favorites
  favoriteClinicIds: string[];
  toggleFavoriteClinic: (id: string) => void;

  // Actions
  addWeightRecord: (petId: string, weight: number, note?: string) => void;
  addVaccination: (vac: Omit<Vaccination, 'id'>) => void;
  bookMockAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => void;

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      set({ authError: msg, authLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('pawprint-token');
    localStorage.removeItem('pawprint-user');
    set({ user: null, token: null, isAuthenticated: false });
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

  // ── Pets ──
  pets: MOCK_PETS,
  selectedPetId: 'pet-1',
  setSelectedPetId: (id) => set({ selectedPetId: id }),
  selectedPet: () => {
    const { pets, selectedPetId } = get();
    return pets.find((p) => p.id === selectedPetId) || pets[0];
  },

  // ── Records ──
  vaccinations: MOCK_VACCINATIONS,
  weightRecords: MOCK_WEIGHT_HISTORY,
  appointments: MOCK_APPOINTMENTS,
  documents: MOCK_DOCUMENTS,
  timeline: MOCK_TIMELINE,

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
          ? '🟢 Back Online: Cloud connection restored'
          : '🟠 Offline Mode: Changes queued locally in SQLite'
      );
    }
  },
  triggerMockSync: () => {
    get().showToast(`🔄 Syncing ${get().pendingSyncCount || 1} pending record(s) to cloud...`);
    setTimeout(() => {
      set({ pendingSyncCount: 0 });
      get().showToast('✅ Sync Complete: All pet records up to date!');
    }, 1200);
  },

  // ── Clinic favorites ──
  favoriteClinicIds: ['c-1', 'c-2'],
  toggleFavoriteClinic: (id) => {
    const favorites = get().favoriteClinicIds;
    const exists = favorites.includes(id);
    const updated = exists ? favorites.filter((f) => f !== id) : [...favorites, id];
    set({ favoriteClinicIds: updated });
    get().showToast(exists ? 'Removed clinic from saved favorites' : 'Saved clinic to favorites');
  },

  // ── Actions ──
  addWeightRecord: (petId, weight, note) => {
    const newRecord: WeightRecord = {
      id: `w-${Date.now()}`,
      petId,
      date: 'Today',
      weight,
      note: note || 'User recorded',
    };
    const current = get().weightRecords[petId] || [];
    set((state) => ({
      weightRecords: { ...state.weightRecords, [petId]: [...current, newRecord] },
      pendingSyncCount: state.isOnline ? 0 : state.pendingSyncCount + 1,
    }));
    get().showToast(`Recorded ${weight} kg for ${get().selectedPet().name}!`);
  },

  addVaccination: (vac) => {
    const newVac: Vaccination = { ...vac, id: `vac-${Date.now()}` };
    set((state) => ({
      vaccinations: [newVac, ...state.vaccinations],
      pendingSyncCount: state.isOnline ? 0 : state.pendingSyncCount + 1,
    }));
    get().showToast(`Vaccination record added: ${vac.name}`);
  },

  bookMockAppointment: (apt) => {
    const newApt: Appointment = { ...apt, id: `apt-${Date.now()}`, status: 'upcoming' };
    set((state) => ({
      appointments: [newApt, ...state.appointments],
      pendingSyncCount: state.isOnline ? 0 : state.pendingSyncCount + 1,
    }));
    get().showToast(`Appointment booked at ${apt.clinicName}!`);
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
