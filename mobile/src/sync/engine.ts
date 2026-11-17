import { api, errorMessage, isNetworkError, uploadForm } from '../api/client';
import {
  type Appointment,
  type MedicalDocument,
  type Pet,
  type Vaccination,
  type WeightRecord,
  listAppointments,
  listDocuments,
  listPets,
  listVaccinations,
  listWeights,
  markPetPhotoSynced,
  removeChildren,
  removeLocal,
  setSyncState,
  upsertAppointmentFromServer,
  upsertDocumentFromServer,
  upsertPetFromServer,
  upsertVaccinationFromServer,
  upsertWeightFromServer,
} from '../db/repository';
import { orderForPush } from '../lib/syncOrder';
import { tokenStore } from '../settings/storage';

interface RemoteId {
  _id: string;
  clientLocalId?: string | null;
  updatedAt?: string;
}

function remoteKey(remote: RemoteId): string {
  return remote.clientLocalId || remote._id;
}

function day(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  return value.slice(0, 10);
}

async function authToken(): Promise<string | null> {
  return tokenStore.get();
}

function petBody(pet: Pet) {
  return {
    clientLocalId: pet.localId,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    dateOfBirth: pet.dateOfBirth,
    microchipId: pet.microchipId,
    allergies: pet.allergies,
    medications: pet.medications,
    emergencyContacts: pet.emergencyContacts,
  };
}

async function pushPet(pet: Pet, token: string) {
  if (pet.deleted) {
    if (pet.serverId) await api.delete(`/pets/${pet.serverId}`);
    await removeChildren(pet.localId);
    await removeLocal('pets', pet.localId);
    return;
  }

  const response = pet.serverId
    ? await api.put(`/pets/${pet.serverId}`, petBody(pet))
    : await api.post('/pets', petBody(pet));
  const serverId = String(response.data._id);
  await setSyncState('pets', pet.localId, 'synced', null, serverId);

  if (pet.photoDirty && pet.photoUri) {
    const form = new FormData();
    const name = pet.photoUri.split('/').pop() || 'photo.jpg';
    form.append('photo', { uri: pet.photoUri, name, type: 'image/jpeg' } as unknown as Blob);
    const uploaded = await uploadForm(`/pets/${serverId}/photo`, form, token) as { photoUrl?: string };
    await markPetPhotoSynced(pet.localId, uploaded.photoUrl || null);
  }
}

async function pushVaccination(record: Vaccination, pet: Pet) {
  if (!pet.serverId || pet.deleted) return;
  if (record.deleted) {
    if (record.serverId) await api.delete(`/vaccinations/${record.serverId}`);
    await removeLocal('vaccinations', record.localId);
    return;
  }
  const body = {
    clientLocalId: record.localId,
    vaccineName: record.vaccineName,
    administrationDate: record.administrationDate,
    nextDueDate: record.nextDueDate,
    veterinarian: record.veterinarian,
    clinic: record.clinic,
    batchNumber: record.batchNumber,
    notes: record.notes,
  };
  const response = record.serverId
    ? await api.put(`/vaccinations/${record.serverId}`, body)
    : await api.post(`/pets/${pet.serverId}/vaccinations`, body);
  await setSyncState('vaccinations', record.localId, 'synced', null, String(response.data._id));
}

async function pushWeight(record: WeightRecord, pet: Pet) {
  if (!pet.serverId || pet.deleted) return;
  if (record.deleted) {
    if (record.serverId) await api.delete(`/weights/${record.serverId}`);
    await removeLocal('weights', record.localId);
    return;
  }
  const body = { clientLocalId: record.localId, weightKg: record.weightKg, recordedAt: record.recordedAt };
  const response = record.serverId
    ? await api.put(`/weights/${record.serverId}`, body)
    : await api.post(`/pets/${pet.serverId}/weights`, body);
  await setSyncState('weights', record.localId, 'synced', null, String(response.data._id));
}

async function pushAppointment(record: Appointment, pet: Pet) {
  if (!pet.serverId || pet.deleted) return;
  if (record.deleted) {
    if (record.serverId) await api.delete(`/appointments/${record.serverId}`);
    await removeLocal('appointments', record.localId);
    return;
  }
  const body = {
    clientLocalId: record.localId,
    pet: pet.serverId,
    clinic: { name: record.clinicName, address: record.clinicAddress },
    date: record.date,
    reason: record.reason,
    notes: record.notes,
    status: record.status,
  };
  const response = record.serverId
    ? await api.put(`/appointments/${record.serverId}`, body)
    : await api.post('/appointments', body);
  await setSyncState('appointments', record.localId, 'synced', null, String(response.data._id));
}

async function pushDocument(record: MedicalDocument, pet: Pet, token: string) {
  if (!pet.serverId || pet.deleted) return;
  if (record.deleted) {
    if (record.serverId) await api.delete(`/documents/${record.serverId}`);
    await removeLocal('documents', record.localId);
    return;
  }
  if (record.serverId || !record.localUri) {
    if (record.serverId) await setSyncState('documents', record.localId, 'synced', null, record.serverId);
    return;
  }
  const form = new FormData();
  form.append('category', record.category);
  form.append('clientLocalId', record.localId);
  const name = record.originalName || record.localUri.split('/').pop() || 'document.jpg';
  form.append('file', {
    uri: record.localUri,
    name,
    type: record.mimeType || 'image/jpeg',
  } as unknown as Blob);
  const uploaded = await uploadForm(`/pets/${pet.serverId}/documents`, form, token) as { _id: string; fileUrl?: string };
  await setSyncState('documents', record.localId, 'synced', null, String(uploaded._id));
}

async function markFailure(
  table: 'pets' | 'vaccinations' | 'weights' | 'appointments' | 'documents',
  localId: string,
  error: unknown,
): Promise<boolean> {
  const offline = isNetworkError(error);
  await setSyncState(table, localId, offline ? 'pending' : 'failed', errorMessage(error));
  return offline;
}

export interface SyncResult {
  pushed: number;
  failed: number;
  offline: boolean;
}

export async function syncNow(): Promise<SyncResult> {
  const token = await authToken();
  if (!token) return { pushed: 0, failed: 0, offline: false };

  let pushed = 0;
  let failed = 0;
  const pets = await listPets();
  const vaccinations = await listVaccinations();
  const weights = await listWeights();
  const appointments = await listAppointments();
  const documents = await listDocuments();

  const pendingPets = pets.filter((row) => row.syncStatus !== 'synced' || row.photoDirty);
  const pendingChildren = orderForPush([
    ...vaccinations.filter((row) => row.syncStatus !== 'synced').map((row) => ({ entity: 'vaccination' as const, localId: row.localId, row })),
    ...weights.filter((row) => row.syncStatus !== 'synced').map((row) => ({ entity: 'weight' as const, localId: row.localId, row })),
    ...appointments.filter((row) => row.syncStatus !== 'synced').map((row) => ({ entity: 'appointment' as const, localId: row.localId, row })),
    ...documents.filter((row) => row.syncStatus !== 'synced').map((row) => ({ entity: 'document' as const, localId: row.localId, row })),
  ]);

  let offline = false;
  for (const pet of pendingPets) {
    try {
      await pushPet(pet, token);
      pushed += 1;
    } catch (error) {
      failed += 1;
      offline = await markFailure('pets', pet.localId, error);
      if (offline) return { pushed, failed, offline: true };
    }
  }

  const refreshedPets = new Map((await listPets()).map((pet) => [pet.localId, pet]));
  for (const item of pendingChildren) {
    const pet = refreshedPets.get(item.row.petLocalId);
    if (!pet?.serverId) continue;
    try {
      if (item.entity === 'vaccination') await pushVaccination(item.row, pet);
      if (item.entity === 'weight') await pushWeight(item.row, pet);
      if (item.entity === 'appointment') await pushAppointment(item.row, pet);
      if (item.entity === 'document') await pushDocument(item.row, pet, token);
      pushed += 1;
    } catch (error) {
      failed += 1;
      const table = item.entity === 'vaccination' ? 'vaccinations'
        : item.entity === 'weight' ? 'weights'
          : item.entity === 'appointment' ? 'appointments'
            : 'documents';
      offline = await markFailure(table, item.localId, error);
      if (offline) return { pushed, failed, offline: true };
    }
  }

  try {
    await pullRemote();
  } catch (error) {
    if (isNetworkError(error)) return { pushed, failed, offline: true };
    throw error;
  }
  return { pushed, failed, offline: false };
}

interface RemotePet extends RemoteId {
  name: string;
  species: string;
  breed?: string;
  gender?: Pet['gender'];
  dateOfBirth?: string;
  photoUrl?: string;
  microchipId?: string;
  allergies?: string[];
  medications?: string[];
  emergencyContacts?: { name?: string; phone?: string }[];
}

function asPet(remote: RemotePet, existing?: Pet): Pet {
  return {
    localId: existing?.localId || remoteKey(remote),
    serverId: remote._id,
    name: remote.name,
    species: remote.species || 'other',
    breed: remote.breed || '',
    gender: remote.gender || 'unknown',
    dateOfBirth: day(remote.dateOfBirth),
    photoUri: existing?.photoUri || null,
    photoUrl: remote.photoUrl || null,
    photoDirty: existing?.photoDirty || false,
    microchipId: remote.microchipId || '',
    allergies: remote.allergies || [],
    medications: remote.medications || [],
    emergencyContacts: (remote.emergencyContacts || [])
      .filter((contact) => contact.name || contact.phone)
      .map((contact) => ({ name: contact.name || '', phone: contact.phone || '' })),
    syncStatus: 'synced',
    syncError: null,
    updatedAt: remote.updatedAt || new Date().toISOString(),
    deleted: false,
  };
}

async function pullRemote() {
  const petsResponse = await api.get<RemotePet[]>('/pets');
  const localPets = await listPets();
  const seenPets = new Set<string>();

  for (const remote of petsResponse.data) {
    const existing = localPets.find((pet) => pet.serverId === remote._id || pet.localId === remote.clientLocalId);
    seenPets.add(existing?.localId || remoteKey(remote));
    if (existing && (existing.syncStatus !== 'synced' || existing.photoDirty)) continue;
    await upsertPetFromServer(asPet(remote, existing));
  }

  const freshPets = await listPets();
  for (const pet of freshPets) {
    if (!seenPets.has(pet.localId) && pet.syncStatus === 'synced' && !pet.photoDirty) {
      await removeChildren(pet.localId);
      await removeLocal('pets', pet.localId);
    }
  }

  const petsWithServer = (await listPets()).filter((pet) => pet.serverId && !pet.deleted);
  for (const pet of petsWithServer) {
    await pullVaccinations(pet);
    await pullWeights(pet);
    await pullDocuments(pet);
  }
  await pullAppointments(petsWithServer);
}

async function pullVaccinations(pet: Pet) {
  const response = await api.get<(RemoteId & {
    vaccineName: string;
    administrationDate: string;
    nextDueDate: string;
    veterinarian?: string;
    clinic?: string;
    batchNumber?: string;
    notes?: string;
  })[]>(`/pets/${pet.serverId}/vaccinations`);
  const local = (await listVaccinations()).filter((row) => row.petLocalId === pet.localId);
  const seen = new Set<string>();
  for (const remote of response.data) {
    const existing = local.find((row) => row.serverId === remote._id || row.localId === remote.clientLocalId);
    const localId = existing?.localId || remoteKey(remote);
    seen.add(localId);
    if (existing && existing.syncStatus !== 'synced') continue;
    await upsertVaccinationFromServer({
      localId,
      serverId: remote._id,
      petLocalId: pet.localId,
      vaccineName: remote.vaccineName,
      administrationDate: day(remote.administrationDate) || '',
      nextDueDate: day(remote.nextDueDate) || '',
      veterinarian: remote.veterinarian || '',
      clinic: remote.clinic || '',
      batchNumber: remote.batchNumber || '',
      notes: remote.notes || '',
      syncStatus: 'synced',
      syncError: null,
      updatedAt: remote.updatedAt || new Date().toISOString(),
      deleted: false,
    });
  }
  for (const row of local) {
    if (!seen.has(row.localId) && row.syncStatus === 'synced') await removeLocal('vaccinations', row.localId);
  }
}

async function pullWeights(pet: Pet) {
  const response = await api.get<(RemoteId & { weightKg: number; recordedAt: string })[]>(`/pets/${pet.serverId}/weights`);
  const local = (await listWeights()).filter((row) => row.petLocalId === pet.localId);
  const seen = new Set<string>();
  for (const remote of response.data) {
    const existing = local.find((row) => row.serverId === remote._id || row.localId === remote.clientLocalId);
    const localId = existing?.localId || remoteKey(remote);
    seen.add(localId);
    if (existing && existing.syncStatus !== 'synced') continue;
    await upsertWeightFromServer({
      localId,
      serverId: remote._id,
      petLocalId: pet.localId,
      weightKg: remote.weightKg,
      recordedAt: remote.recordedAt,
      syncStatus: 'synced',
      syncError: null,
      updatedAt: remote.updatedAt || new Date().toISOString(),
      deleted: false,
    });
  }
  for (const row of local) {
    if (!seen.has(row.localId) && row.syncStatus === 'synced') await removeLocal('weights', row.localId);
  }
}

async function pullDocuments(pet: Pet) {
  const response = await api.get<(RemoteId & {
    category: MedicalDocument['category'];
    fileUrl?: string;
    originalName?: string;
    mimeType?: string;
  })[]>(`/pets/${pet.serverId}/documents`);
  const local = (await listDocuments()).filter((row) => row.petLocalId === pet.localId);
  const seen = new Set<string>();
  for (const remote of response.data) {
    const existing = local.find((row) => row.serverId === remote._id || row.localId === remote.clientLocalId);
    const localId = existing?.localId || remoteKey(remote);
    seen.add(localId);
    if (existing && existing.syncStatus !== 'synced') continue;
    await upsertDocumentFromServer({
      localId,
      serverId: remote._id,
      petLocalId: pet.localId,
      category: remote.category,
      localUri: existing?.localUri || null,
      fileUrl: remote.fileUrl || null,
      originalName: remote.originalName || remote.category,
      mimeType: remote.mimeType || '',
      syncStatus: 'synced',
      syncError: null,
      updatedAt: remote.updatedAt || new Date().toISOString(),
      deleted: false,
    });
  }
  for (const row of local) {
    if (!seen.has(row.localId) && row.syncStatus === 'synced') await removeLocal('documents', row.localId);
  }
}

async function pullAppointments(pets: Pet[]) {
  const response = await api.get<(RemoteId & {
    pet: string;
    clinic?: { name?: string; address?: string };
    date: string;
    reason?: string;
    notes?: string;
    status?: Appointment['status'];
  })[]>('/appointments');
  const local = await listAppointments();
  const seen = new Set<string>();
  for (const remote of response.data) {
    const pet = pets.find((item) => item.serverId === String(remote.pet));
    if (!pet) continue;
    const existing = local.find((row) => row.serverId === remote._id || row.localId === remote.clientLocalId);
    const localId = existing?.localId || remoteKey(remote);
    seen.add(localId);
    if (existing && existing.syncStatus !== 'synced') continue;
    await upsertAppointmentFromServer({
      localId,
      serverId: remote._id,
      petLocalId: pet.localId,
      clinicName: remote.clinic?.name || 'Clinic',
      clinicAddress: remote.clinic?.address || '',
      date: remote.date,
      reason: remote.reason || '',
      notes: remote.notes || '',
      status: remote.status || 'scheduled',
      syncStatus: 'synced',
      syncError: null,
      updatedAt: remote.updatedAt || new Date().toISOString(),
      deleted: false,
    });
  }
  for (const row of local) {
    if (!seen.has(row.localId) && row.syncStatus === 'synced') await removeLocal('appointments', row.localId);
  }
}
