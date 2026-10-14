// The backend's Pet/Vaccination/WeightRecord/Appointment/Document shapes (Mongoose
// documents) don't match the frontend's display-oriented types 1:1. These functions
// are the one place that translation happens, so components never have to guess at
// backend field names.

import { fileUrl } from './api';
import { Pet, Vaccination, VaccinationStatus, WeightRecord, Appointment, MedicalDocument, Clinic, Medication, Expense, ExpenseCategory } from '../types';

// Friendly stock photo until the owner uploads their own
const defaultPetPhoto = (species?: string) => {
  const s = species?.toLowerCase();
  return s === 'cat' ? '/images/cat-peek.webp' : s === 'dog' ? '/images/dog-portrait.webp' : '/images/cat-dog-cuddle.webp';
};

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
  targetWeightMinKg?: number | null;
  targetWeightMaxKg?: number | null;
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
    // weight is filled in separately after fetching WeightRecords
    weight: 0,
    targetWeightMinKg: bp.targetWeightMinKg ?? null,
    targetWeightMaxKg: bp.targetWeightMaxKg ?? null,
    photo: fileUrl(bp.photoUrl) || defaultPetPhoto(bp.species),
    hasCustomPhoto: !!bp.photoUrl,
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
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function mapBackendWeightRecord(bw: BackendWeightRecord): WeightRecord {
  return {
    id: bw._id,
    petId: bw.pet,
    date: formatWeightDate(bw.recordedAt || bw.createdAt),
    recordedAt: bw.recordedAt || bw.createdAt,
    weight: bw.weightKg,
    trendPercent: bw.trendPercent ?? null,
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
    clinicAddress: ba.clinic?.address || '',
    date: formatAppointmentDate(ba.date),
    time: formatAppointmentTime(ba.date),
    dateISO: ba.date,
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
    uploadedAt: bd.createdAt,
    fileSize: '',
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
  isFavorite?: boolean;
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
    isFavorite: !!bc.isFavorite,
    emergency24_7: bc.emergency24_7 || false,
  };
}

// ── Medication ────────────────────────────────────────────────────────────────

type BackendMedication = Omit<Medication, 'id' | 'petId' | 'dosage' | 'endDate' | 'instructions' | 'prescribedBy'> & {
  _id: string;
  pet: string;
  dosage?: string;
  endDate?: string | null;
  instructions?: string;
  prescribedBy?: string;
};

export function mapBackendMedication(bm: BackendMedication): Medication {
  return {
    id: bm._id,
    petId: bm.pet,
    name: bm.name,
    dosage: bm.dosage || '',
    frequency: bm.frequency,
    startDate: bm.startDate,
    endDate: bm.endDate || null,
    instructions: bm.instructions || '',
    prescribedBy: bm.prescribedBy || '',
    doses: bm.doses ?? [],
    schedule: bm.schedule,
  };
}

// "Apoquel — 1 tablet, twice a day" for summaries and Emergency Mode
export function medicationLabel(m: Pick<Medication, 'name' | 'dosage'> & { schedule?: { frequencyLabel: string }; frequencyLabel?: string }): string {
  const freq = m.schedule?.frequencyLabel ?? m.frequencyLabel;
  const detail = [m.dosage, freq?.toLowerCase()].filter(Boolean).join(', ');
  return detail ? `${m.name} — ${detail}` : m.name;
}

// Everything the pet is currently taking: tracked courses (with dose and
// frequency) plus any free-text medications typed on the profile
export function currentMedicationLabels(pet: Pick<Pet, 'id' | 'medications'>, medications: Medication[]): string[] {
  const tracked = medications.filter((m) => m.petId === pet.id && m.schedule.active);
  const trackedNames = new Set(tracked.map((m) => m.name.trim().toLowerCase()));
  return [
    ...tracked.map(medicationLabel),
    ...pet.medications.filter((m) => !trackedNames.has(m.trim().toLowerCase())),
  ];
}

// ── Expense ───────────────────────────────────────────────────────────────────

type BackendExpense = {
  _id: string;
  pet: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  vendor?: string;
  appointment?: string | null;
};

export function mapBackendExpense(be: BackendExpense): Expense {
  return {
    id: be._id,
    petId: be.pet,
    category: be.category,
    amount: be.amount,
    date: be.date,
    description: be.description || '',
    vendor: be.vendor || '',
    appointmentId: be.appointment || null,
  };
}

// Where a weight sits against the pet's target range (mirrors the backend rule)
export function weightTargetStatus(kg: number, min: number | null, max: number | null): { status: 'below' | 'within' | 'above'; percent: number } | null {
  if (!kg || (min == null && max == null)) return null;
  if (min != null && kg < min) return { status: 'below', percent: Math.round(((min - kg) / min) * 100) };
  if (max != null && kg > max) return { status: 'above', percent: Math.round(((kg - max) / max) * 100) };
  return { status: 'within', percent: 0 };
}
