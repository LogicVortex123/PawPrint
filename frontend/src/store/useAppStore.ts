import { create } from 'zustand';
import { MOCK_PETS, MOCK_VACCINATIONS, MOCK_WEIGHT_HISTORY, MOCK_DOCUMENTS, MOCK_TIMELINE, MOCK_APPOINTMENTS } from '../data/mockData';
import { Pet, Vaccination, WeightRecord, MedicalDocument, HealthTimelineEntry, Appointment } from '../types';

interface AppState {
  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Selected Pet
  pets: Pet[];
  selectedPetId: string;
  setSelectedPetId: (id: string) => void;
  selectedPet: () => Pet;

  // Records state
  vaccinations: Vaccination[];
  weightRecords: Record<string, WeightRecord[]>;
  appointments: Appointment[];
  documents: MedicalDocument[];
  timeline: HealthTimelineEntry[];

  // Offline Simulation state
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

  // UI Toasts
  toastMessage: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pawprint-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  }
  return 'light';
};

export const useAppStore = create<AppState>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      localStorage.setItem('pawprint-theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: next });
  },
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pawprint-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },

  pets: MOCK_PETS,
  selectedPetId: 'pet-1',
  setSelectedPetId: (id) => set({ selectedPetId: id }),
  selectedPet: () => {
    const { pets, selectedPetId } = get();
    return pets.find((p) => p.id === selectedPetId) || pets[0];
  },

  vaccinations: MOCK_VACCINATIONS,
  weightRecords: MOCK_WEIGHT_HISTORY,
  appointments: MOCK_APPOINTMENTS,
  documents: MOCK_DOCUMENTS,
  timeline: MOCK_TIMELINE,

  isOnline: true,
  pendingSyncCount: 0,
  toggleNetworkSimulation: () => {
    const nextState = !get().isOnline;
    set({ isOnline: nextState });
    if (nextState && get().pendingSyncCount > 0) {
      get().triggerMockSync();
    } else {
      get().showToast(nextState ? '🟢 Back Online: Cloud connection restored' : '🟠 Offline Mode: Changes queued locally in SQLite');
    }
  },

  triggerMockSync: () => {
    get().showToast(`🔄 Syncing ${get().pendingSyncCount || 1} pending record(s) to cloud...`);
    setTimeout(() => {
      set({ pendingSyncCount: 0 });
      get().showToast('✅ Sync Complete: All pet records up to date!');
    }, 1200);
  },

  favoriteClinicIds: ['c-1', 'c-2'],
  toggleFavoriteClinic: (id) => {
    const favorites = get().favoriteClinicIds;
    const exists = favorites.includes(id);
    const updated = exists ? favorites.filter((f) => f !== id) : [...favorites, id];
    set({ favoriteClinicIds: updated });
    get().showToast(exists ? 'Removed clinic from saved favorites' : 'Saved clinic to favorites');
  },

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
      weightRecords: {
        ...state.weightRecords,
        [petId]: [...current, newRecord],
      },
      pendingSyncCount: state.isOnline ? 0 : state.pendingSyncCount + 1,
    }));
    get().showToast(`Recorded ${weight} kg for ${get().selectedPet().name}!`);
  },

  addVaccination: (vac) => {
    const newVac: Vaccination = {
      ...vac,
      id: `vac-${Date.now()}`,
    };
    set((state) => ({
      vaccinations: [newVac, ...state.vaccinations],
      pendingSyncCount: state.isOnline ? 0 : state.pendingSyncCount + 1,
    }));
    get().showToast(`Vaccination record added: ${vac.name}`);
  },

  bookMockAppointment: (apt) => {
    const newApt: Appointment = {
      ...apt,
      id: `apt-${Date.now()}`,
      status: 'upcoming',
    };
    set((state) => ({
      appointments: [newApt, ...state.appointments],
      pendingSyncCount: state.isOnline ? 0 : state.pendingSyncCount + 1,
    }));
    get().showToast(`Appointment booked at ${apt.clinicName}!`);
  },

  toastMessage: null,
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 4000);
  },
  clearToast: () => set({ toastMessage: null }),
}));
