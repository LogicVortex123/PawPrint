import React, { useEffect, useRef, useState } from 'react';
import { PawPrint, Loader2, Plus, Camera, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../common/Modal';
import { PetSpecies } from '../../types';

interface AddPetModalProps {
  onClose: () => void;
  onCreated?: (petId: string) => void;
}

const SPECIES = [
  { value: 'dog', label: 'Dog', emoji: '🐶' },
  { value: 'cat', label: 'Cat', emoji: '🐱' },
  { value: 'other', label: 'Other', emoji: '🐾' },
] as const;

export const AddPetModal: React.FC<AddPetModalProps> = ({ onClose, onCreated }) => {
  const { createPet, addWeightRecord, uploadPetPhoto, showToast } = useAppStore();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [dob, setDob] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [targetMin, setTargetMin] = useState('');
  const [targetMax, setTargetMax] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [microchipId, setMicrochipId] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('⚠️ Please choose an image file (JPG, PNG or WebP).'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('⚠️ Photo is too large. Maximum size is 10 MB.'); return; }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('⚠️ Please enter your pet\'s name.');
      return;
    }

    const minWeight = targetMin.trim() ? Number(targetMin) : null;
    const maxWeight = targetMax.trim() ? Number(targetMax) : null;
    if ((minWeight !== null && !(minWeight > 0)) || (maxWeight !== null && !(maxWeight > 0))) {
      showToast('⚠️ Target weights must be positive numbers.');
      return;
    }
    if (minWeight !== null && maxWeight !== null && minWeight > maxWeight) {
      showToast('⚠️ Target minimum weight cannot exceed maximum weight.');
      return;
    }
    const parsedWeight = initialWeight.trim() ? Number(initialWeight) : null;
    if (parsedWeight !== null && !(parsedWeight > 0 && parsedWeight <= 200)) {
      showToast('⚠️ Current weight should be between 0.1 and 200 kg.');
      return;
    }

    setSaving(true);
    try {
      const newPet = await createPet({
        name: trimmedName,
        species,
        breed: breed.trim() || undefined,
        gender,
        dateOfBirth: dob || undefined,
        allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
        medications: medications.split(',').map((s) => s.trim()).filter(Boolean),
        microchipId: microchipId.trim() || undefined,
        emergencyContacts: contactName.trim()
          ? [{ name: contactName.trim(), phone: contactPhone.trim() }]
          : undefined,
        targetWeightMinKg: minWeight ?? undefined,
        targetWeightMaxKg: maxWeight ?? undefined,
      });

      // Extras are saved after the profile exists; a failure here doesn't undo the pet
      if (parsedWeight !== null) {
        try { await addWeightRecord(newPet.id, parsedWeight); } catch { showToast('⚠️ The pet was added, but the weight could not be saved.'); }
      }
      if (photo) {
        try { await uploadPetPhoto(newPet.id, photo); } catch { showToast('⚠️ The pet was added, but the photo could not be uploaded.'); }
      }

      onCreated?.(newPet.id);
      onClose();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not add pet. Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Add a new pet" subtitle="Create a health & medical profile" icon={PawPrint} onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => photoRef.current?.click()}
            className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-dashed border-paw-sage/60 bg-paw-light-sage dark:bg-paw-darkcard text-paw-forest dark:text-paw-sage flex items-center justify-center hover:border-paw-forest transition-colors group"
            aria-label={photo ? 'Change photo' : 'Add a photo'}>
            {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />}
          </button>
          <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickPhoto} />
          <div className="flex-1">
            <label className="label" htmlFor="new-pet-name">Pet name *</label>
            <input id="new-pet-name" required autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Milo, Luna, Charlie" className="input" maxLength={60} />
          </div>
        </div>

        <div>
          <span className="label">Species</span>
          <div className="grid grid-cols-3 gap-2.5">
            {SPECIES.map((s) => (
              <button key={s.value} type="button" onClick={() => setSpecies(s.value)} aria-pressed={species === s.value}
                className={`py-3 rounded-2xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${species === s.value
                  ? 'bg-paw-forest text-white border-paw-forest shadow-soft scale-[1.02]'
                  : 'bg-white dark:bg-paw-darkcard text-paw-dark dark:text-white border-paw-line dark:border-paw-darkborder hover:border-paw-forest'}`}>
                <span className="text-lg">{s.emoji}</span>{s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="new-pet-breed">Breed</label>
            <input id="new-pet-breed" type="text" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="e.g. Golden Retriever" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="new-pet-gender">Gender</label>
            <select id="new-pet-gender" value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="input">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="new-pet-dob">Date of birth</label>
            <input id="new-pet-dob" type="date" value={dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDob(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="new-pet-weight">Current weight (kg)</label>
            <input id="new-pet-weight" type="number" min="0.1" max="200" step="0.1" value={initialWeight} onChange={(e) => setInitialWeight(e.target.value)} placeholder="e.g. 14.5" className="input" />
          </div>
        </div>

        <button type="button" onClick={() => setShowMore((v) => !v)} aria-expanded={showMore}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-paw-mist dark:bg-paw-darkcard text-sm font-bold text-paw-dark dark:text-white">
          Health details <span className="font-medium text-paw-secondary dark:text-paw-warm-sage">(optional — you can add these later)</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>

        {showMore && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="label">Healthy weight range (kg)</span>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="0.1" step="0.1" value={targetMin} onChange={(e) => setTargetMin(e.target.value)} placeholder="Min, e.g. 12" aria-label="Target weight minimum" className="input" />
                <input type="number" min="0.1" step="0.1" value={targetMax} onChange={(e) => setTargetMax(e.target.value)} placeholder="Max, e.g. 16" aria-label="Target weight maximum" className="input" />
              </div>
              <p className="text-[11px] text-paw-secondary dark:text-paw-warm-sage mt-1">Shown as a band on the weight chart; you get a reminder if a weigh-in falls outside it.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="new-pet-allergies">Known allergies</label>
                <input id="new-pet-allergies" type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Comma-separated, e.g. Beef, Pollen" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="new-pet-meds">Other medications</label>
                <input id="new-pet-meds" type="text" value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="e.g. Flea preventive" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="new-pet-contact">Emergency contact / vet</label>
                <input id="new-pet-contact" type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. City Vet Hospital" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="new-pet-phone">Contact phone</label>
                <input id="new-pet-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="e.g. +91 98765 43210" className="input" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="new-pet-chip">Microchip ID</label>
              <input id="new-pet-chip" type="text" value={microchipId} onChange={(e) => setMicrochipId(e.target.value)} placeholder="15-digit ISO microchip code" className="input" maxLength={40} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating profile…</> : <><Plus className="w-4 h-4" /> Add pet</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};
