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
  // Healthy range set by the owner/vet; null when not set
  targetWeightMinKg: number | null;
  targetWeightMaxKg: number | null;
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

// Smart Reminders item, as returned by GET /reminders
export interface Reminder {
  id: string;
  type: 'vaccination' | 'appointment' | 'weight' | 'medication';
  urgency: 'urgent' | 'upcoming' | 'info';
  petId: string;
  petName: string;
  title: string;
  message: string;
  dueDate: string | null;
  daysUntil: number | null;
  // Appointments only: when the booking was last saved
  bookedAt?: string | null;
}

export interface UserPreferences {
  reminders: { vaccination: boolean; appointment: boolean; weight: boolean; medication: boolean };
  reminderLeadDays: number;
  emailReminders: boolean;
  currency: Currency;
}

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD' | 'AED' | 'JPY';

export const DEFAULT_PREFERENCES: UserPreferences = {
  reminders: { vaccination: true, appointment: true, weight: true, medication: true },
  reminderLeadDays: 14,
  emailReminders: false,
  currency: 'INR',
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  authProvider: string;
  hasPassword?: boolean;
  preferences?: UserPreferences;
  favoriteClinicIds?: string[];
}

export type ThemePreference = 'light' | 'dark' | 'system';

export type MedicationFrequency =
  | 'once_daily' | 'twice_daily' | 'three_times_daily' | 'every_other_day' | 'weekly' | 'monthly' | 'as_needed';

// A medication course with today's schedule, as returned by the medications API
export interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD, null = ongoing
  instructions: string;
  prescribedBy: string;
  doses: { date: string; slot: number; givenAt: string }[]; // last ~31 days
  schedule: {
    active: boolean;
    frequencyLabel: string;
    dueToday: number;
    givenToday: number[];
    remainingToday: number;
    missedYesterday: number;
    endsInDays: number | null;
    adherence7: number | null; // % of scheduled doses given, null = nothing was due
    adherence30: number | null;
    streak: number;
    history: { date: string; due: number; given: number }[]; // last 14 days, oldest first
  };
}

export interface MedicationInput {
  name: string;
  dosage?: string;
  frequency: MedicationFrequency;
  startDate: string;
  endDate?: string;
  instructions?: string;
  prescribedBy?: string;
}

// Read-only link to a pet's health summary (owner's view)
export interface ShareLink {
  id: string;
  token: string;
  label: string;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
  viewCount: number;
  lastViewedAt: string | null;
}

export type ExpenseCategory = 'vet' | 'medication' | 'food' | 'grooming' | 'insurance' | 'supplies' | 'training' | 'boarding' | 'other';

export interface Expense {
  id: string;
  petId: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  vendor: string;
  appointmentId: string | null;
}

export interface ExpenseInput {
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  vendor?: string;
  appointment?: string | null;
}

export interface ExpenseSummary {
  currency: Currency;
  year: number;
  total: number;
  count: number;
  byMonth: number[]; // Jan..Dec
  byCategory: { category: ExpenseCategory; label: string; total: number; count: number }[];
  byPet: Record<string, number>;
  thisMonth: number;
  lastMonth: number;
  monthlyAverage: number;
  largest: { id: string; amount: number; description: string; category: ExpenseCategory; date: string } | null;
}

// Suggested vaccine from GET /vaccinations/catalog
export interface VaccineSuggestion {
  name: string;
  core: boolean;
  intervalMonths: number;
  description: string;
}
