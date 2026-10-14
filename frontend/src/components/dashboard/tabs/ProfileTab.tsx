import React, { useRef, useState } from 'react';
import { PawPrint, AlertCircle, Shield, Phone, Camera, Loader2, Pencil, Plus, Cake, Scale, User, Check } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { currentMedicationLabels } from '../../../lib/adapters';
import { formatDateKey } from '../../../lib/dates';
import { PetAvatar, SectionHeader, speciesEmoji } from '../../ui';
import type { TabProps } from './types';

const Field: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-paw-mist dark:bg-paw-darksurface">
    <span className="w-9 h-9 rounded-xl bg-white dark:bg-paw-darkcard text-paw-forest dark:text-paw-sage flex items-center justify-center shadow-2xs flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">{label}</div>
      <div className="text-sm font-bold text-paw-dark dark:text-white truncate">{value}</div>
    </div>
  </div>
);

export const ProfileTab: React.FC<TabProps> = ({ pet, goTo, onEditPet, onAddPet }) => {
  const { pets, medications, uploadPetPhoto, showToast } = useAppStore();
  const photoRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const medLabels = currentMedicationLabels(pet, medications);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('⚠️ Please choose an image file (JPG, PNG or WebP).'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('⚠️ Photo is too large. Maximum size is 10 MB.'); return; }
    setUploading(true);
    try { await uploadPetPhoto(pet.id, file); } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not upload photo — please try again.'}`);
    } finally { setUploading(false); }
  };

  const range = pet.targetWeightMinKg != null || pet.targetWeightMaxKg != null
    ? `${pet.targetWeightMinKg ?? '–'}–${pet.targetWeightMaxKg ?? '–'} kg` : 'Not set';

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader icon={PawPrint} tone="forest" eyebrow="Profile & medical ID" title={`${pet.name}'s ID card`}
        description="Identity, allergies, current medications and who to call — everything a vet or sitter needs to know."
        actions={<>
          <button onClick={onAddPet} className="btn-secondary"><Plus className="w-4 h-4" /> Add pet</button>
          <button onClick={onEditPet} className="btn-primary"><Pencil className="w-4 h-4" /> Edit profile</button>
        </>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ID card */}
        <div className="card overflow-hidden">
          <div className="relative h-28 bg-gradient-to-br from-paw-forest to-emerald-500">
            <div className="absolute inset-0 bg-paw-pattern opacity-30" />
            <span className="absolute top-3 right-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/80">PawPrint ID</span>
          </div>
          <div className="px-6 pb-6 -mt-14 text-center">
            <div className="relative w-28 h-28 mx-auto">
              <PetAvatar pet={pet} className="w-full h-full ring-4 ring-white dark:ring-paw-darkcard shadow-soft-lg" />
              <button type="button" onClick={() => photoRef.current?.click()} disabled={uploading}
                title={pet.hasCustomPhoto ? 'Change photo' : 'Upload a photo'} aria-label={pet.hasCustomPhoto ? 'Change photo' : 'Upload a photo'}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-paw-forest text-white flex items-center justify-center shadow-soft-lg hover:bg-paw-deep hover:scale-110 transition-all disabled:opacity-60 ring-2 ring-white dark:ring-paw-darkcard">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto} />
            </div>
            <h3 className="mt-3 font-display text-3xl font-semibold text-paw-dark dark:text-white">{pet.name}</h3>
            <p className="text-sm font-semibold text-paw-forest dark:text-paw-sage">{pet.breed || (pet.species === 'dog' ? 'Dog' : pet.species === 'cat' ? 'Cat' : 'Pet')} {speciesEmoji(pet.species)}</p>
            <div className="mt-4 pt-4 border-t border-dashed border-paw-line dark:border-paw-darkborder">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Microchip</div>
              <div className="font-mono text-sm font-bold text-paw-dark dark:text-white tracking-wider">{pet.microchipId || 'Not recorded'}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field icon={<User className="w-4 h-4" />} label="Gender" value={pet.gender} />
            <Field icon={<Cake className="w-4 h-4" />} label="Born · age" value={pet.dob ? `${formatDateKey(pet.dob)} · ${pet.age}` : pet.age || 'Unknown'} />
            <Field icon={<Scale className="w-4 h-4" />} label="Current weight" value={pet.weight > 0 ? `${pet.weight} kg` : 'No weigh-ins yet'} />
            <Field icon={<Check className="w-4 h-4" />} label="Healthy range" value={range} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-3xl p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/70 dark:border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-sm mb-3"><AlertCircle className="w-4 h-4" />Known allergies</div>
              {pet.allergies.length === 0 ? <p className="text-xs text-rose-900/70 dark:text-rose-200/70">No known allergies recorded.</p> : (
                <div className="flex flex-wrap gap-1.5">{pet.allergies.map((a) => <span key={a} className="px-2.5 py-1 rounded-full bg-white dark:bg-rose-500/15 text-xs font-bold text-rose-800 dark:text-rose-200">{a}</span>)}</div>
              )}
            </div>
            <div className="rounded-3xl p-5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200/70 dark:border-violet-500/20">
              <div className="flex items-center gap-2 text-violet-800 dark:text-violet-300 font-extrabold text-sm mb-3"><Shield className="w-4 h-4" />Current medications</div>
              {medLabels.length === 0 ? <p className="text-xs text-violet-900/70 dark:text-violet-200/70">No current medications.</p> : (
                <div className="flex flex-wrap gap-1.5">{medLabels.map((m) => <span key={m} className="px-2.5 py-1 rounded-full bg-white dark:bg-violet-500/15 text-xs font-bold text-violet-800 dark:text-violet-200">{m}</span>)}</div>
              )}
              <button onClick={() => goTo('medications')} className="mt-3 text-[11px] font-bold text-violet-800 dark:text-violet-300 hover:underline">Track doses &amp; reminders →</button>
            </div>
          </div>

          <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center"><Phone className="w-5 h-5" /></span>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Emergency contact / vet</div>
                <div className="text-sm font-bold text-paw-dark dark:text-white">{pet.emergencyContact.name || 'Not added yet'}</div>
                {pet.emergencyContact.phone && <div className="text-xs text-paw-secondary dark:text-paw-warm-sage">{pet.emergencyContact.phone}</div>}
              </div>
            </div>
            {pet.emergencyContact.phone ? (
              <a href={`tel:${pet.emergencyContact.phone}`} className="btn-primary"><Phone className="w-4 h-4" /> Call now</a>
            ) : (
              <button onClick={onEditPet} className="btn-secondary"><Plus className="w-4 h-4" /> Add contact</button>
            )}
          </div>
        </div>
      </div>

      {/* All pets */}
      <div>
        <h3 className="text-sm font-extrabold text-paw-dark dark:text-white mb-3">Your pets ({pets.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {pets.map((p) => (
            <button key={p.id} onClick={() => goTo('pet-profiles', p.id)}
              className={`card card-interactive p-4 flex items-center gap-3 text-left ${p.id === pet.id ? 'ring-2 ring-paw-forest dark:ring-paw-sage' : ''}`}>
              <PetAvatar pet={p} className="w-11 h-11" />
              <div className="min-w-0">
                <div className="text-sm font-bold text-paw-dark dark:text-white truncate">{p.name}</div>
                <div className="text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{speciesEmoji(p.species)} {p.breed || p.age}</div>
              </div>
            </button>
          ))}
          <button onClick={onAddPet} className="rounded-3xl border-2 border-dashed border-paw-sage/50 p-4 flex items-center justify-center gap-2 text-sm font-bold text-paw-forest dark:text-paw-sage hover:border-paw-forest hover:bg-paw-light-sage/50 dark:hover:bg-paw-darkcard transition-colors">
            <Plus className="w-4 h-4" /> Add a pet
          </button>
        </div>
      </div>
    </div>
  );
};
