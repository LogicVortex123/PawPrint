import { getDb } from './database';
import { createLocalId } from '../lib/id';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';
export type Gender = 'male' | 'female' | 'unknown';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';
export type DocumentCategory = 'Prescription' | 'Medical Report' | 'Insurance' | 'Adoption';

export interface EmergencyContact {
  name: string;
  phone: string;
}

interface SyncFields {
  localId: string;
  serverId: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
  updatedAt: string;
  deleted: boolean;
}

export interface Pet extends SyncFields {
  name: string;
  species: string;
  breed: string;
  gender: Gender;
  dateOfBirth: string | null;
  photoUri: string | null;
  photoUrl: string | null;
  photoDirty: boolean;
  microchipId: string;
  allergies: string[];
  medications: string[];
  emergencyContacts: EmergencyContact[];
}

export interface Vaccination extends SyncFields {
  petLocalId: string;
  vaccineName: string;
  administrationDate: string;
  nextDueDate: string;
  veterinarian: string;
  clinic: string;
  batchNumber: string;
  notes: string;
}

export interface WeightRecord extends SyncFields {
  petLocalId: string;
  weightKg: number;
  recordedAt: string;
}

export interface Appointment extends SyncFields {
  petLocalId: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  reason: string;
  notes: string;
  status: AppointmentStatus;
}

export interface MedicalDocument extends SyncFields {
  petLocalId: string;
  category: DocumentCategory;
  localUri: string | null;
  fileUrl: string | null;
  originalName: string;
  mimeType: string;
}

type Row = Record<string, unknown>;

function text(row: Row, key: string): string {
  const value = row[key];
  return typeof value === 'string' ? value : '';
}

function nullable(row: Row, key: string): string | null {
  const value = row[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function syncFields(row: Row): SyncFields {
  return {
    localId: text(row, 'local_id'),
    serverId: nullable(row, 'server_id'),
    syncStatus: text(row, 'sync_status') as SyncStatus,
    syncError: nullable(row, 'sync_error'),
    updatedAt: text(row, 'updated_at'),
    deleted: row.deleted === 1,
  };
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapPet(row: Row): Pet {
  return {
    ...syncFields(row),
    name: text(row, 'name'),
    species: text(row, 'species'),
    breed: text(row, 'breed'),
    gender: (text(row, 'gender') || 'unknown') as Gender,
    dateOfBirth: nullable(row, 'date_of_birth'),
    photoUri: nullable(row, 'photo_uri'),
    photoUrl: nullable(row, 'photo_url'),
    photoDirty: row.photo_dirty === 1,
    microchipId: text(row, 'microchip_id'),
    allergies: parseJson(text(row, 'allergies_json'), []),
    medications: parseJson(text(row, 'medications_json'), []),
    emergencyContacts: parseJson(text(row, 'emergency_json'), []),
  };
}

function mapVaccination(row: Row): Vaccination {
  return {
    ...syncFields(row),
    petLocalId: text(row, 'pet_local_id'),
    vaccineName: text(row, 'vaccine_name'),
    administrationDate: text(row, 'administration_date'),
    nextDueDate: text(row, 'next_due_date'),
    veterinarian: text(row, 'veterinarian'),
    clinic: text(row, 'clinic'),
    batchNumber: text(row, 'batch_number'),
    notes: text(row, 'notes'),
  };
}

function mapWeight(row: Row): WeightRecord {
  return {
    ...syncFields(row),
    petLocalId: text(row, 'pet_local_id'),
    weightKg: Number(row.weight_kg),
    recordedAt: text(row, 'recorded_at'),
  };
}

function mapAppointment(row: Row): Appointment {
  return {
    ...syncFields(row),
    petLocalId: text(row, 'pet_local_id'),
    clinicName: text(row, 'clinic_name'),
    clinicAddress: text(row, 'clinic_address'),
    date: text(row, 'date'),
    reason: text(row, 'reason'),
    notes: text(row, 'notes'),
    status: (text(row, 'status') || 'scheduled') as AppointmentStatus,
  };
}

function mapDocument(row: Row): MedicalDocument {
  return {
    ...syncFields(row),
    petLocalId: text(row, 'pet_local_id'),
    category: text(row, 'category') as DocumentCategory,
    localUri: nullable(row, 'local_uri'),
    fileUrl: nullable(row, 'file_url'),
    originalName: text(row, 'original_name'),
    mimeType: text(row, 'mime_type'),
  };
}

const nowIso = () => new Date().toISOString();

export async function listPets(): Promise<Pet[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM pets ORDER BY name COLLATE NOCASE');
  return rows.map(mapPet);
}

export async function listVaccinations(): Promise<Vaccination[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM vaccinations ORDER BY next_due_date');
  return rows.map(mapVaccination);
}

export async function listWeights(): Promise<WeightRecord[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM weights ORDER BY recorded_at');
  return rows.map(mapWeight);
}

export async function listAppointments(): Promise<Appointment[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM appointments ORDER BY date');
  return rows.map(mapAppointment);
}

export async function listDocuments(): Promise<MedicalDocument[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM documents ORDER BY updated_at DESC');
  return rows.map(mapDocument);
}

export interface PetInput {
  name: string;
  species: string;
  breed: string;
  gender: Gender;
  dateOfBirth: string | null;
  photoUri: string | null;
  microchipId: string;
  allergies: string[];
  medications: string[];
  emergencyContacts: EmergencyContact[];
}

export async function insertPet(input: PetInput): Promise<string> {
  const db = await getDb();
  const localId = createLocalId();
  await db.runAsync(
    `INSERT INTO pets (
      local_id, name, species, breed, gender, date_of_birth, photo_uri, photo_dirty,
      microchip_id, allergies_json, medications_json, emergency_json, sync_status, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    localId,
    input.name,
    input.species,
    input.breed,
    input.gender,
    input.dateOfBirth,
    input.photoUri,
    input.photoUri ? 1 : 0,
    input.microchipId,
    JSON.stringify(input.allergies),
    JSON.stringify(input.medications),
    JSON.stringify(input.emergencyContacts),
    nowIso(),
  );
  return localId;
}

export async function updatePet(localId: string, input: PetInput, photoChanged: boolean) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE pets SET
      name = ?, species = ?, breed = ?, gender = ?, date_of_birth = ?,
      photo_uri = CASE WHEN ? = 1 THEN ? ELSE photo_uri END,
      photo_dirty = CASE WHEN ? = 1 THEN 1 ELSE photo_dirty END,
      microchip_id = ?, allergies_json = ?, medications_json = ?, emergency_json = ?,
      sync_status = 'pending', sync_error = NULL, updated_at = ?, deleted = 0
    WHERE local_id = ?`,
    input.name,
    input.species,
    input.breed,
    input.gender,
    input.dateOfBirth,
    photoChanged ? 1 : 0,
    input.photoUri,
    photoChanged ? 1 : 0,
    input.microchipId,
    JSON.stringify(input.allergies),
    JSON.stringify(input.medications),
    JSON.stringify(input.emergencyContacts),
    nowIso(),
    localId,
  );
}

export async function markDeleted(table: 'pets' | 'vaccinations' | 'weights' | 'appointments' | 'documents', localId: string) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE ${table} SET deleted = 1, sync_status = 'pending', sync_error = NULL, updated_at = ? WHERE local_id = ?`,
    nowIso(),
    localId,
  );
}

export interface VaccinationInput {
  petLocalId: string;
  vaccineName: string;
  administrationDate: string;
  nextDueDate: string;
  veterinarian: string;
  clinic: string;
  batchNumber: string;
  notes: string;
}

export async function insertVaccination(input: VaccinationInput): Promise<string> {
  const db = await getDb();
  const localId = createLocalId();
  await db.runAsync(
    `INSERT INTO vaccinations (
      local_id, pet_local_id, vaccine_name, administration_date, next_due_date,
      veterinarian, clinic, batch_number, notes, sync_status, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    localId,
    input.petLocalId,
    input.vaccineName,
    input.administrationDate,
    input.nextDueDate,
    input.veterinarian,
    input.clinic,
    input.batchNumber,
    input.notes,
    nowIso(),
  );
  return localId;
}

export async function insertWeight(petLocalId: string, weightKg: number, recordedAt: string): Promise<string> {
  const db = await getDb();
  const localId = createLocalId();
  await db.runAsync(
    `INSERT INTO weights (local_id, pet_local_id, weight_kg, recorded_at, sync_status, updated_at)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
    localId,
    petLocalId,
    weightKg,
    recordedAt,
    nowIso(),
  );
  return localId;
}

export interface AppointmentInput {
  petLocalId: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  reason: string;
  notes: string;
}

export async function insertAppointment(input: AppointmentInput): Promise<string> {
  const db = await getDb();
  const localId = createLocalId();
  await db.runAsync(
    `INSERT INTO appointments (
      local_id, pet_local_id, clinic_name, clinic_address, date, reason, notes, status, sync_status, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', 'pending', ?)`,
    localId,
    input.petLocalId,
    input.clinicName,
    input.clinicAddress,
    input.date,
    input.reason,
    input.notes,
    nowIso(),
  );
  return localId;
}

export async function insertDocument(input: {
  petLocalId: string;
  category: DocumentCategory;
  localUri: string;
  originalName: string;
  mimeType: string;
}): Promise<string> {
  const db = await getDb();
  const localId = createLocalId();
  await db.runAsync(
    `INSERT INTO documents (
      local_id, pet_local_id, category, local_uri, original_name, mime_type, sync_status, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    localId,
    input.petLocalId,
    input.category,
    input.localUri,
    input.originalName,
    input.mimeType,
    nowIso(),
  );
  return localId;
}

export async function setSyncState(
  table: 'pets' | 'vaccinations' | 'weights' | 'appointments' | 'documents',
  localId: string,
  status: SyncStatus,
  error: string | null,
  serverId?: string | null,
) {
  const db = await getDb();
  if (serverId !== undefined) {
    await db.runAsync(
      `UPDATE ${table} SET sync_status = ?, sync_error = ?, server_id = ?, updated_at = ? WHERE local_id = ?`,
      status,
      error,
      serverId,
      nowIso(),
      localId,
    );
    return;
  }
  await db.runAsync(
    `UPDATE ${table} SET sync_status = ?, sync_error = ?, updated_at = ? WHERE local_id = ?`,
    status,
    error,
    nowIso(),
    localId,
  );
}

export async function markPetPhotoSynced(localId: string, photoUrl: string | null) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE pets SET photo_dirty = 0, photo_url = ?, updated_at = ? WHERE local_id = ?',
    photoUrl,
    nowIso(),
    localId,
  );
}

export async function removeLocal(table: 'pets' | 'vaccinations' | 'weights' | 'appointments' | 'documents', localId: string) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${table} WHERE local_id = ?`, localId);
}

export async function removeChildren(petLocalId: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM vaccinations WHERE pet_local_id = ?', petLocalId);
  await db.runAsync('DELETE FROM weights WHERE pet_local_id = ?', petLocalId);
  await db.runAsync('DELETE FROM appointments WHERE pet_local_id = ?', petLocalId);
  await db.runAsync('DELETE FROM documents WHERE pet_local_id = ?', petLocalId);
}

export async function upsertPetFromServer(pet: Pet) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO pets (
      local_id, server_id, name, species, breed, gender, date_of_birth, photo_uri, photo_url, photo_dirty,
      microchip_id, allergies_json, medications_json, emergency_json, sync_status, sync_error, updated_at, deleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', NULL, ?, 0)
    ON CONFLICT(local_id) DO UPDATE SET
      server_id = excluded.server_id,
      name = excluded.name,
      species = excluded.species,
      breed = excluded.breed,
      gender = excluded.gender,
      date_of_birth = excluded.date_of_birth,
      photo_url = excluded.photo_url,
      photo_uri = CASE WHEN pets.photo_dirty = 1 THEN pets.photo_uri ELSE excluded.photo_uri END,
      photo_dirty = CASE WHEN pets.photo_dirty = 1 THEN 1 ELSE 0 END,
      microchip_id = excluded.microchip_id,
      allergies_json = excluded.allergies_json,
      medications_json = excluded.medications_json,
      emergency_json = excluded.emergency_json,
      sync_status = 'synced',
      sync_error = NULL,
      deleted = 0,
      updated_at = excluded.updated_at`,
    pet.localId,
    pet.serverId,
    pet.name,
    pet.species,
    pet.breed,
    pet.gender,
    pet.dateOfBirth,
    pet.photoUri,
    pet.photoUrl,
    pet.photoDirty ? 1 : 0,
    pet.microchipId,
    JSON.stringify(pet.allergies),
    JSON.stringify(pet.medications),
    JSON.stringify(pet.emergencyContacts),
    pet.updatedAt,
  );
}

export async function upsertVaccinationFromServer(record: Vaccination) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO vaccinations (
      local_id, server_id, pet_local_id, vaccine_name, administration_date, next_due_date,
      veterinarian, clinic, batch_number, notes, sync_status, updated_at, deleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, 0)
    ON CONFLICT(local_id) DO UPDATE SET
      server_id = excluded.server_id,
      vaccine_name = excluded.vaccine_name,
      administration_date = excluded.administration_date,
      next_due_date = excluded.next_due_date,
      veterinarian = excluded.veterinarian,
      clinic = excluded.clinic,
      batch_number = excluded.batch_number,
      notes = excluded.notes,
      sync_status = 'synced',
      sync_error = NULL,
      deleted = 0,
      updated_at = excluded.updated_at`,
    record.localId,
    record.serverId,
    record.petLocalId,
    record.vaccineName,
    record.administrationDate,
    record.nextDueDate,
    record.veterinarian,
    record.clinic,
    record.batchNumber,
    record.notes,
    record.updatedAt,
  );
}

export async function upsertWeightFromServer(record: WeightRecord) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO weights (local_id, server_id, pet_local_id, weight_kg, recorded_at, sync_status, updated_at, deleted)
     VALUES (?, ?, ?, ?, ?, 'synced', ?, 0)
     ON CONFLICT(local_id) DO UPDATE SET
       server_id = excluded.server_id,
       weight_kg = excluded.weight_kg,
       recorded_at = excluded.recorded_at,
       sync_status = 'synced',
       sync_error = NULL,
       deleted = 0,
       updated_at = excluded.updated_at`,
    record.localId,
    record.serverId,
    record.petLocalId,
    record.weightKg,
    record.recordedAt,
    record.updatedAt,
  );
}

export async function upsertAppointmentFromServer(record: Appointment) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO appointments (
      local_id, server_id, pet_local_id, clinic_name, clinic_address, date, reason, notes, status, sync_status, updated_at, deleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, 0)
    ON CONFLICT(local_id) DO UPDATE SET
      server_id = excluded.server_id,
      clinic_name = excluded.clinic_name,
      clinic_address = excluded.clinic_address,
      date = excluded.date,
      reason = excluded.reason,
      notes = excluded.notes,
      status = excluded.status,
      sync_status = 'synced',
      sync_error = NULL,
      deleted = 0,
      updated_at = excluded.updated_at`,
    record.localId,
    record.serverId,
    record.petLocalId,
    record.clinicName,
    record.clinicAddress,
    record.date,
    record.reason,
    record.notes,
    record.status,
    record.updatedAt,
  );
}

export async function upsertDocumentFromServer(record: MedicalDocument) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO documents (
      local_id, server_id, pet_local_id, category, local_uri, file_url, original_name, mime_type, sync_status, updated_at, deleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, 0)
    ON CONFLICT(local_id) DO UPDATE SET
      server_id = excluded.server_id,
      category = excluded.category,
      file_url = excluded.file_url,
      local_uri = COALESCE(documents.local_uri, excluded.local_uri),
      original_name = excluded.original_name,
      mime_type = excluded.mime_type,
      sync_status = 'synced',
      sync_error = NULL,
      deleted = 0,
      updated_at = excluded.updated_at`,
    record.localId,
    record.serverId,
    record.petLocalId,
    record.category,
    record.localUri,
    record.fileUrl,
    record.originalName,
    record.mimeType,
    record.updatedAt,
  );
}

export async function attachDocumentFile(localId: string, localUri: string) {
  const db = await getDb();
  await db.runAsync('UPDATE documents SET local_uri = ? WHERE local_id = ?', localUri, localId);
}
