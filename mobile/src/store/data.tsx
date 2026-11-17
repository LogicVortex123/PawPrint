import NetInfo from '@react-native-community/netinfo';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  type Appointment,
  type AppointmentInput,
  type DocumentCategory,
  type MedicalDocument,
  type Pet,
  type PetInput,
  type Vaccination,
  type VaccinationInput,
  type WeightRecord,
  insertAppointment,
  insertDocument,
  insertPet,
  insertVaccination,
  insertWeight,
  listAppointments,
  listDocuments,
  listPets,
  listVaccinations,
  listWeights,
  markDeleted,
  updatePet,
} from '../db/repository';
import { notifySyncFinished, scheduleAppointmentReminders, scheduleVaccinationReminder } from '../notifications/reminders';
import { getActivePetId, setActivePetId } from '../settings/storage';
import { useSession } from './session';
import { syncNow } from '../sync/engine';

interface Snapshot {
  pets: Pet[];
  vaccinations: Vaccination[];
  weights: WeightRecord[];
  appointments: Appointment[];
  documents: MedicalDocument[];
}

interface DataValue extends Snapshot {
  activePet: Pet | null;
  syncing: boolean;
  online: boolean;
  syncNote: string | null;
  refresh: () => Promise<void>;
  sync: () => Promise<void>;
  choosePet: (localId: string) => Promise<void>;
  savePet: (input: PetInput, localId?: string, photoChanged?: boolean) => Promise<void>;
  removePet: (localId: string) => Promise<void>;
  saveVaccination: (input: VaccinationInput) => Promise<void>;
  removeVaccination: (localId: string) => Promise<void>;
  saveWeight: (petLocalId: string, weightKg: number, recordedAt: string) => Promise<void>;
  removeWeight: (localId: string) => Promise<void>;
  saveAppointment: (input: AppointmentInput) => Promise<void>;
  removeAppointment: (localId: string) => Promise<void>;
  saveDocument: (input: { petLocalId: string; category: DocumentCategory; localUri: string; originalName: string; mimeType: string }) => Promise<void>;
  removeDocument: (localId: string) => Promise<void>;
}

const DataContext = createContext<DataValue | null>(null);

const empty: Snapshot = { pets: [], vaccinations: [], weights: [], appointments: [], documents: [] };

async function readAll(): Promise<Snapshot> {
  const [pets, vaccinations, weights, appointments, documents] = await Promise.all([
    listPets(),
    listVaccinations(),
    listWeights(),
    listAppointments(),
    listDocuments(),
  ]);
  return { pets, vaccinations, weights, appointments, documents };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [snapshot, setSnapshot] = useState<Snapshot>(empty);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(true);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await readAll();
    setSnapshot(next);
    const saved = await getActivePetId();
    const visible = next.pets.filter((pet) => !pet.deleted);
    const chosen = visible.find((pet) => pet.localId === saved)?.localId || visible[0]?.localId || null;
    setActiveId(chosen);
    if (chosen && chosen !== saved) await setActivePetId(chosen);
  }, []);

  const sync = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const before = await readAll();
      const hadPending = [before.pets, before.vaccinations, before.weights, before.appointments, before.documents]
        .some((rows) => rows.some((row) => row.syncStatus !== 'synced' || ('photoDirty' in row && row.photoDirty)));
      const result = await syncNow();
      if (result.offline) setSyncNote('Saved on this phone. Sync will retry when you are online.');
      else if (result.failed > 0) setSyncNote('Some records could not sync. Pull to try again.');
      else setSyncNote(null);
      if (hadPending && !result.offline) await notifySyncFinished(result.failed);
    } catch {
      setSyncNote('Sync did not finish. Your latest changes are still on this phone.');
    } finally {
      await refresh();
      setSyncing(false);
    }
  }, [refresh, user]);

  useEffect(() => {
    const subscription = NetInfo.addEventListener((state) => {
      const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline(connected);
      if (connected) void sync();
    });
    return () => subscription();
  }, [sync]);

  useEffect(() => {
    if (!user) {
      setSnapshot(empty);
      setActiveId(null);
      return;
    }
    refresh().then(() => sync());
  }, [user, refresh, sync]);

  const choosePet = useCallback(async (localId: string) => {
    setActiveId(localId);
    await setActivePetId(localId);
  }, []);

  const savePet = useCallback(async (input: PetInput, localId?: string, photoChanged = false) => {
    if (localId) await updatePet(localId, input, photoChanged);
    else {
      const created = await insertPet(input);
      await setActivePetId(created);
      setActiveId(created);
    }
    await refresh();
    void sync();
  }, [refresh, sync]);

  const removePet = useCallback(async (localId: string) => {
    await markDeleted('pets', localId);
    await refresh();
    void sync();
  }, [refresh, sync]);

  const saveVaccination = useCallback(async (input: VaccinationInput) => {
    const localId = await insertVaccination(input);
    const pet = (await listPets()).find((item) => item.localId === input.petLocalId);
    await scheduleVaccinationReminder(
      { ...input, localId, serverId: null, syncStatus: 'pending', syncError: null, updatedAt: '', deleted: false },
      pet?.name || 'Your pet',
    );
    await refresh();
    void sync();
  }, [refresh, sync]);

  const removeVaccination = useCallback(async (localId: string) => {
    await markDeleted('vaccinations', localId);
    await refresh();
    void sync();
  }, [refresh, sync]);

  const saveWeight = useCallback(async (petLocalId: string, weightKg: number, recordedAt: string) => {
    await insertWeight(petLocalId, weightKg, recordedAt);
    await refresh();
    void sync();
  }, [refresh, sync]);

  const removeWeight = useCallback(async (localId: string) => {
    await markDeleted('weights', localId);
    await refresh();
    void sync();
  }, [refresh, sync]);

  const saveAppointment = useCallback(async (input: AppointmentInput) => {
    const localId = await insertAppointment(input);
    const pet = (await listPets()).find((item) => item.localId === input.petLocalId);
    await scheduleAppointmentReminders(
      {
        ...input,
        localId,
        serverId: null,
        status: 'scheduled',
        syncStatus: 'pending',
        syncError: null,
        updatedAt: '',
        deleted: false,
      },
      pet?.name || 'Your pet',
    );
    await refresh();
    void sync();
  }, [refresh, sync]);

  const removeAppointment = useCallback(async (localId: string) => {
    await markDeleted('appointments', localId);
    await refresh();
    void sync();
  }, [refresh, sync]);

  const saveDocument = useCallback(async (input: {
    petLocalId: string;
    category: DocumentCategory;
    localUri: string;
    originalName: string;
    mimeType: string;
  }) => {
    await insertDocument(input);
    await refresh();
    void sync();
  }, [refresh, sync]);

  const removeDocument = useCallback(async (localId: string) => {
    await markDeleted('documents', localId);
    await refresh();
    void sync();
  }, [refresh, sync]);

  const activePet = snapshot.pets.find((pet) => pet.localId === activeId && !pet.deleted) || null;

  const value = useMemo<DataValue>(() => ({
    ...snapshot,
    activePet,
    syncing,
    online,
    syncNote,
    refresh,
    sync,
    choosePet,
    savePet,
    removePet,
    saveVaccination,
    removeVaccination,
    saveWeight,
    removeWeight,
    saveAppointment,
    removeAppointment,
    saveDocument,
    removeDocument,
  }), [
    snapshot, activePet, syncing, online, syncNote, refresh, sync, choosePet, savePet, removePet,
    saveVaccination, removeVaccination, saveWeight, removeWeight, saveAppointment, removeAppointment,
    saveDocument, removeDocument,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData must be used inside DataProvider');
  return value;
}
