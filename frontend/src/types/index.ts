export type PetSpecies = 'dog' | 'cat' | 'other';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  gender: 'Male' | 'Female';
  dob: string;
  age: string;
  weight: number; // in kg
  targetWeightRange: [number, number];
  photo: string;
  hasCustomPhoto: boolean;
  allergies: string[];
  medications: string[];
  microchipId: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

export type VaccinationStatus = 'completed' | 'upcoming' | 'overdue';

export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  administeredDate: string;
  nextDueDate: string;
  veterinarian: string;
  clinic: string;
  status: VaccinationStatus;
  batchNumber?: string;
}

export interface WeightRecord {
  id: string;
  petId: string;
  date: string;
  recordedAt: string; // ISO timestamp — used for sorting and the edit form
  weight: number;
  trendPercent: number | null; // % change vs the previous weigh-in, computed by the backend
  note?: string;
}

export interface Appointment {
  id: string;
  petId: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  time: string;
  dateISO: string; // raw appointment timestamp — used for sorting and the edit form
  veterinarian: string;
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Clinic {
  id: string;
  name: string;
  distance: string;
  address: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  hours: string;
  isFavorite: boolean;
  emergency24_7: boolean;
}

export type DocumentCategory = 'Prescription' | 'Medical Report' | 'Insurance' | 'Adoption';

export interface MedicalDocument {
  id: string;
  petId: string;
  title: string;
  category: DocumentCategory;
  date: string;
  uploadedAt: string; // ISO timestamp
  fileSize: string;
  fileUrl?: string;
}

export interface HealthTimelineEntry {
  id: string;
  petId: string;
  title: string;
  category: 'vaccination' | 'weight' | 'appointment' | 'document';
  date: string;
  sortDate: string; // ISO timestamp — `date` is display-formatted and can't be sorted as a string
  description: string;
  statusColor?: string;
}

export interface UserPreferences {
  reminders: { vaccination: boolean; appointment: boolean; weight: boolean };
  reminderLeadDays: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  reminders: { vaccination: true, appointment: true, weight: true },
  reminderLeadDays: 14,
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  authProvider: string;
  hasPassword?: boolean;
  preferences?: UserPreferences;
}

export type ThemePreference = 'light' | 'dark' | 'system';
