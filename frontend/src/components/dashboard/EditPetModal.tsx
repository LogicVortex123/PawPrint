import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { StorageKeys, readJson, writeJson, removeKey } from '../../lib/storage';
import { Pet } from '../../types';
import { Modal } from '../common/Modal';

type Draft = {
  name: string; species: 'dog' | 'cat' | 'other'; breed: string; gender: 'male' | 'female'; dob: string;
  allergies: string; medications: string; contactName: string; contactPhone: string; microchipId: string;
  targetMin?: string; targetMax?: string;
};

const draftKey = (petId: string) => `${StorageKeys.draftPrefix}edit-pet-${petId}`;

const fromPet = (pet: Pet): Draft => ({
  name: pet.name,
  species: pet.species,
  breed: pet.breed || '',
  gender: pet.gender === 'Female' ? 'female' : 'male',
  dob: pet.dob || '',
  allergies: pet.allergies.join(', '),
  medications: pet.medications.join(', '),
  contactName: pet.emergencyContact.name,
  contactPhone: pet.emergencyContact.phone,
  microchipId: pet.microchipId,
  targetMin: pet.targetWeightMinKg != null ? String(pet.targetWeightMinKg) : '',
  targetMax: pet.targetWeightMaxKg != null ? String(pet.targetWeightMaxKg) : '',
});

// Edit form for a pet's profile. Unsaved edits are kept in localStorage so a
// refresh doesn't lose them; closing (cancel, save or delete) discards the draft.
export const EditPetModal: React.FC<{ pet: Pet; onClose: () => void; onDeleted?: () => void }> = ({ pet, onClose, onDeleted }) => {
  const { updatePet, deletePet, showToast } = useAppStore();
  const [restored] = useState(() => readJson<Draft | null>(draftKey(pet.id), null));
  const [f, setF] = useState<Draft>(() => restored ?? fromPet(pet));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const set = (patch: Partial<Draft>) => setF((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (restored) showToast(`📝 Restored your unsaved changes to ${pet.name}'s profile.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Only keep a draft once something actually differs from the saved profile
  useEffect(() => {
    if (JSON.stringify(f) === JSON.stringify(fromPet(pet))) removeKey(draftKey(pet.id));
    else writeJson(draftKey(pet.id), f);
  }, [f, pet]);

  const close = () => { removeKey(draftKey(pet.id)); onClose(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) { showToast('⚠️ Pet name cannot be empty.'); return; }
    const targetMin = f.targetMin?.trim() ? Number(f.targetMin) : null;
    const targetMax = f.targetMax?.trim() ? Number(f.targetMax) : null;
    if ((targetMin !== null && !(targetMin > 0)) || (targetMax !== null && !(targetMax > 0))) { showToast('⚠️ Target weights must be positive numbers.'); return; }
    if (targetMin !== null && targetMax !== null && targetMin > targetMax) { showToast('⚠️ The target minimum is larger than the maximum.'); return; }
    setSaving(true);
    try {
      await updatePet(pet.id, {
        name: f.name.trim(),
        species: f.species,
        breed: f.breed.trim(),
        gender: f.gender,
        dateOfBirth: f.dob || undefined,
        allergies: f.allergies.split(',').map((s) => s.trim()).filter(Boolean),
        medications: f.medications.split(',').map((s) => s.trim()).filter(Boolean),
        microchipId: f.microchipId.trim(),
        emergencyContacts: f.contactName.trim() ? [{ name: f.contactName.trim(), phone: f.contactPhone.trim() }] : [],
        targetWeightMinKg: targetMin,
        targetWeightMaxKg: targetMax,
      });
      close();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not update pet profile — please try again.'}`);
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${pet.name}'s profile and every record that belongs to it? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      removeKey(draftKey(pet.id));
      await deletePet(pet.id);
      onClose();
      onDeleted?.();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not delete pet profile — please try again.'}`);
      setDeleting(false);
    }
  };

  return (
    <Modal title={`Edit ${pet.name}'s profile`} subtitle="Identity, health details and contacts" icon={Pencil} onClose={close} maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ep-name">Name</label>
            <input id="ep-name" required value={f.name} onChange={(e) => set({ name: e.target.value })} className="input" maxLength={60} />
          </div>
          <div>
            <label className="label" htmlFor="ep-species">Species</label>
            <select id="ep-species" value={f.species} onChange={(e) => set({ species: e.target.value as Draft['species'] })} className="input">
              <option value="dog">🐶 Dog</option>
              <option value="cat">🐱 Cat</option>
              <option value="other">🐾 Other</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ep-breed">Breed</label>
            <input id="ep-breed" value={f.breed} onChange={(e) => set({ breed: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="ep-gender">Gender</label>
            <select id="ep-gender" value={f.gender} onChange={(e) => set({ gender: e.target.value as Draft['gender'] })} className="input">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ep-dob">Date of birth</label>
            <input id="ep-dob" type="date" value={f.dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set({ dob: e.target.value })} className="input" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="ep-allergies">Allergies</label>
            <input id="ep-allergies" value={f.allergies} onChange={(e) => set({ allergies: e.target.value })} placeholder="Comma-separated, e.g. Chicken, Dust mites" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="ep-meds">Other medications</label>
            <input id="ep-meds" value={f.medications} onChange={(e) => set({ medications: e.target.value })} placeholder="e.g. Heartgard Plus (monthly)" className="input" />
          </div>
        </div>
        <p className="-mt-2 text-[11px] text-paw-secondary dark:text-paw-warm-sage">For dose reminders and a daily checklist, add medicines in the Medications section instead.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="ep-contact">Emergency contact</label>
            <input id="ep-contact" value={f.contactName} onChange={(e) => set({ contactName: e.target.value })} placeholder="Vet or clinic name" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="ep-phone">Contact phone</label>
            <input id="ep-phone" type="tel" value={f.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ep-chip">Microchip ID</label>
            <input id="ep-chip" value={f.microchipId} onChange={(e) => set({ microchipId: e.target.value })} className="input font-mono" maxLength={40} />
          </div>
        </div>

        <div>
          <span className="label">Healthy weight range (kg)</span>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min="0" step="0.1" value={f.targetMin} onChange={(e) => set({ targetMin: e.target.value })} placeholder="Min, e.g. 25" aria-label="Target weight minimum" className="input" />
            <input type="number" min="0" step="0.1" value={f.targetMax} onChange={(e) => set({ targetMax: e.target.value })} placeholder="Max, e.g. 30" aria-label="Target weight maximum" className="input" />
          </div>
          <p className="text-[11px] text-paw-secondary dark:text-paw-warm-sage mt-1">Ask your vet for {pet.name}&apos;s ideal range. It shows on the weight chart, and you get a reminder if a weigh-in falls outside it.</p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button type="button" onClick={remove} disabled={deleting || saving} className="btn-danger-outline">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} {deleting ? 'Deleting…' : 'Delete pet'}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving || deleting} className="btn-primary">{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save changes'}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
