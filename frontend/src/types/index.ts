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
  weight: number;
  note?: string;
}

export interface Appointment {
  id: string;
  petId: string;
  clinicName: string;
  date: string;
  time: string;
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
  fileSize: string;
  syncedOffline: boolean;
  fileUrl?: string;
}

export interface HealthTimelineEntry {
  id: string;
  petId: string;
  title: string;
  category: 'vaccination' | 'weight' | 'appointment' | 'document';
  date: string;
  description: string;
  statusColor?: string;
}
