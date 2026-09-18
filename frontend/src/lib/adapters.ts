// The backend's Pet/Vaccination/WeightRecord/Appointment/Document shapes (Mongoose
// documents) don't match the frontend's display-oriented types 1:1. These functions
// are the one place that translation happens, so components never have to guess at
// backend field names.

import { Pet, Vaccination, VaccinationStatus, WeightRecord, Appointment, MedicalDocument, Clinic } from '../types';

// ── Pet ──────────────────────────────────────────────────────────────────────

type BackendPet = {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  gender?: 'male' | 'female' | 'unknown';
  dateOfBirth?: string;
  photoUrl?: string;
  allergies?: string[];
  medications?: string[];
  microchipId?: string;
  emergencyContacts?: { name?: string; phone?: string }[];
};

function computeAge(dateOfBirth?: string): string {
  if (!dateOfBirth) return 'Age unknown';
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return 'Age unknown';

  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0 && months <= 0) return 'Newborn';
  const yearPart = years > 0 ? `${years} yr${years !== 1 ? 's' : ''}` : '';
  const monthPart = months > 0 ? `${months} mo${months !== 1 ? 's' : ''}` : '';
  return [yearPart, monthPart].filter(Boolean).join(' ');
}

export function mapBackendPet(bp: BackendPet): Pet {
  const contact = bp.emergencyContacts?.[0];

  return {
    id: bp._id,
    name: bp.name,
    species: bp.species?.toLowerCase() === 'cat' ? 'cat' : bp.species?.toLowerCase() === 'dog' ? 'dog' : 'other',
    breed: bp.breed || '',
    gender: bp.gender === 'female' ? 'Female' : 'Male',
    dob: bp.dateOfBirth ? new Date(bp.dateOfBirth).toISOString().split('T')[0] : '',
    age: computeAge(bp.dateOfBirth),
    // weight and targetWeightRange are updated separately after fetching WeightRecords
    weight: 0,
    targetWeightRange: [0, 0],
    photo: bp.photoUrl || (bp.species?.toLowerCase() === 'cat' ? '/cat.jpg' : '/dog.jpg'),
    allergies: bp.allergies?.filter(Boolean) ?? [],
    medications: bp.medications?.filter(Boolean) ?? [],
    microchipId: bp.microchipId || '',
    emergencyContact: {
      name: contact?.name || '',
      phone: contact?.phone || '',
      relation: 'Emergency contact',
    },
  };
}


// ── Vaccination ───────────────────────────────────────────────────────────────

type BackendVaccination = {
  _id: string;
  pet: string;
  vaccineName: string;
  administrationDate: string;
  nextDueDate: string;
  veterinarian?: string;
  clinic?: string;
  batchNumber?: string;
  status: 'Completed' | 'Upcoming' | 'Overdue';
};

export function mapBackendVaccination(bv: BackendVaccination): Vaccination {
  return {
    id: bv._id,
    petId: bv.pet,
    name: bv.vaccineName,
    administeredDate: bv.administrationDate?.slice(0, 10),
    nextDueDate: bv.nextDueDate?.slice(0, 10),
    veterinarian: bv.veterinarian || 'Not specified',
    clinic: bv.clinic || 'Not specified',
    status: bv.status.toLowerCase() as VaccinationStatus,
    batchNumber: bv.batchNumber,
  };
}

// ── WeightRecord ──────────────────────────────────────────────────────────────

type BackendWeightRecord = {
  _id: string;
  pet: string;
  weightKg: number;
  recordedAt: string;
  createdAt: string;
  trendPercent?: number | null;
};

function formatWeightDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function mapBackendWeightRecord(bw: BackendWeightRecord): WeightRecord {
  return {
    id: bw._id,
    petId: bw.pet,
    date: formatWeightDate(bw.recordedAt || bw.createdAt),
    weight: bw.weightKg,
    note: undefined,
  };
}

// ── Appointment ───────────────────────────────────────────────────────────────

type BackendAppointment = {
  _id: string;
  owner: string;
  pet: string;
  clinic: { name: string; address?: string };
  date: string;
  reason?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
};

function formatAppointmentDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Unknown date';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAppointmentTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function mapBackendAppointment(ba: BackendAppointment): Appointment {
  // Backend uses 'scheduled'; frontend type uses 'upcoming'
  const statusMap: Record<string, 'upcoming' | 'completed' | 'cancelled'> = {
    scheduled: 'upcoming',
    completed: 'completed',
    cancelled: 'cancelled',
  };
  return {
    id: ba._id,
    petId: ba.pet,
    clinicName: ba.clinic?.name || 'Unknown clinic',
    date: formatAppointmentDate(ba.date),
    time: formatAppointmentTime(ba.date),
    veterinarian: 'Vet',
    reason: ba.reason || 'General checkup',
    status: statusMap[ba.status] ?? 'upcoming',
    notes: ba.notes,
  };
}

// ── MedicalDocument ───────────────────────────────────────────────────────────

type BackendDocument = {
  _id: string;
  pet: string;
  category: 'Prescription' | 'Medical Report' | 'Insurance' | 'Adoption';
  fileUrl: string;
  originalName?: string;
  mimeType?: string;
  createdAt: string;
};

export function mapBackendDocument(bd: BackendDocument): MedicalDocument {
  return {
    id: bd._id,
    petId: bd.pet,
    title: bd.originalName || 'Uploaded document',
    category: bd.category,
    date: formatAppointmentDate(bd.createdAt),
    fileSize: '',
    syncedOffline: false,
    fileUrl: bd.fileUrl,
  };
}

// ── Clinic ────────────────────────────────────────────────────────────────────

type BackendClinic = {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviewsCount?: number;
  hours?: string;
  emergency24_7?: boolean;
  distanceKm?: number;
};

export function mapBackendClinic(bc: BackendClinic): Clinic {
  return {
    id: bc._id,
    name: bc.name,
    distance: bc.distanceKm !== undefined ? `${bc.distanceKm} km` : 'Distance unknown',
    address: bc.address || '',
    rating: bc.rating || 0,
    reviewsCount: bc.reviewsCount || 0,
    phone: bc.phone || '',
    hours: bc.hours || '',
    isFavorite: false,
    emergency24_7: bc.emergency24_7 || false,
  };
}
