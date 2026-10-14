import React, { useState } from 'react';
import { Pill, Plus, Pencil, Check, Flame, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Modal, inputCls, labelCls, primaryBtnCls, dangerBtnCls } from '../common/Modal';
import { Medication, MedicationFrequency, MedicationInput, Pet } from '../../types';
import { todayKey, formatDateKey } from '../../lib/dates';
import { EmptyState, ProgressRing, SectionHeader } from '../ui';

const FREQUENCY_OPTIONS: { value: MedicationFrequency; label: string }[] = [
  { value: 'once_daily', label: 'Once a day' },
  { value: 'twice_daily', label: 'Twice a day' },
  { value: 'three_times_daily', label: 'Three times a day' },
  { value: 'every_other_day', label: 'Every other day' },
  { value: 'weekly', label: 'Once a week' },
  { value: 'monthly', label: 'Once a month' },
  { value: 'as_needed', label: 'Only when needed' },
];

// What each dose of the day is called on the checklist buttons
function slotLabels(frequency: MedicationFrequency, count: number): string[] {
  if (frequency === 'twice_daily') return ['Morning', 'Evening'];
  if (frequency === 'three_times_daily') return ['Morning', 'Afternoon', 'Evening'];
  return Array.from({ length: count }, () => "Today's dose");
}

const adherenceColor = (pct: number | null) =>
  pct === null ? 'bg-gray-300 dark:bg-gray-600' : pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500';

// ── Add / edit form ──────────────────────────────────────────────────────────

const MedicationFormModal: React.FC<{ pet: Pet; medication?: Medication; onClose: () => void }> = ({ pet, medication, onClose }) => {
  const { addMedication, updateMedication, deleteMedication, showToast } = useAppStore();
  const [form, setForm] = useState<MedicationInput>({
    name: medication?.name ?? '',
    dosage: medication?.dosage ?? '',
    frequency: medication?.frequency ?? 'once_daily',
    startDate: medication?.startDate ?? todayKey(),
    endDate: medication?.endDate ?? '',
    instructions: medication?.instructions ?? '',
    prescribedBy: medication?.prescribedBy ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const set = (patch: Partial<MedicationInput>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('⚠️ Please enter the medication name.'); return; }
    if (form.endDate && form.endDate < form.startDate) { showToast('⚠️ The end date is before the start date.'); return; }
    setSaving(true);
    try {
      const input = { ...form, name: form.name.trim(), endDate: form.endDate || '' };
      if (medication) await updateMedication(medication.id, input);
      else await addMedication(pet.id, input);
      onClose();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not save the medication — please try again.'}`);
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!medication || !window.confirm(`Remove ${medication.name} and its dose history?`)) return;
    setDeleting(true);
    try {
      await deleteMedication(medication.id);
      onClose();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not remove the medication.'}`);
      setDeleting(false);
    }
  };

  return (
    <Modal title={medication ? `Edit ${medication.name}` : `New medication for ${pet.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>Medication *</label>
            <input required value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Apoquel, Amoxicillin" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Dose</label>
            <input value={form.dosage} onChange={(e) => set({ dosage: e.target.value })} placeholder="e.g. 1 tablet, 5 mg" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>How often</label>
            <select value={form.frequency} onChange={(e) => set({ frequency: e.target.value as MedicationFrequency })} className={inputCls}>
              {FREQUENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Start date *</label>
            <input required type="date" value={form.startDate} onChange={(e) => set({ startDate: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End date (blank = ongoing)</label>
            <input type="date" value={form.endDate} min={form.startDate} onChange={(e) => set({ endDate: e.target.value })} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Instructions</label>
            <input value={form.instructions} onChange={(e) => set({ instructions: e.target.value })} placeholder="e.g. Give with food" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Prescribed by</label>
            <input value={form.prescribedBy} onChange={(e) => set({ prescribedBy: e.target.value })} placeholder="Vet or clinic (optional)" className={inputCls} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          {medication ? (
            <button type="button" onClick={remove} disabled={deleting} className={dangerBtnCls}>
              <Trash2 className="w-3.5 h-3.5" /><span>{deleting ? 'Removing…' : 'Remove'}</span>
            </button>
          ) : <span />}
          <button type="submit" disabled={saving} className={primaryBtnCls}>{saving ? 'Saving…' : medication ? 'Save changes' : 'Add medication'}</button>
        </div>
      </form>
    </Modal>
  );
};

// ── Today's checklist row ────────────────────────────────────────────────────

export const DoseChecklist: React.FC<{ med: Medication }> = ({ med }) => {
  const { setDoseGiven, showToast } = useAppStore();
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const isAsNeeded = med.frequency === 'as_needed';

  const toggle = async (slot: number, given: boolean) => {
    setBusySlot(slot);
    try {
      await setDoseGiven(med.id, slot, given);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not update the dose.'}`);
    } finally { setBusySlot(null); }
  };

  const givenAt = (slot: number) => {
    const dose = med.doses.find((d) => d.date === todayKey() && d.slot === slot);
    return dose ? new Date(dose.givenAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  };

  if (isAsNeeded) {
    const count = med.schedule.givenToday.length;
    const nextSlot = count ? Math.max(...med.schedule.givenToday) + 1 : 0;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => toggle(nextSlot, true)} disabled={busySlot !== null || nextSlot > 23}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep disabled:opacity-60">
          {busySlot !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Log a dose
        </button>
        <span className="text-xs text-paw-secondary dark:text-paw-warm-sage">
          {count ? `Given ${count}× today` : 'Not given today'}
        </span>
        {count > 0 && (
          <button onClick={() => toggle(Math.max(...med.schedule.givenToday), false)} disabled={busySlot !== null}
            className="text-xs font-semibold text-paw-secondary hover:text-rose-600 underline">Undo last</button>
        )}
      </div>
    );
  }

  const labels = slotLabels(med.frequency, med.schedule.dueToday);
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label, slot) => {
        const given = med.schedule.givenToday.includes(slot);
        return (
          <button key={slot} onClick={() => toggle(slot, !given)} disabled={busySlot === slot}
            aria-pressed={given} title={given ? 'Click to undo' : 'Mark as given'}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-colors disabled:opacity-60 ${given
              ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-white dark:bg-paw-darksurface border-paw-soft-sage dark:border-paw-darkborder text-paw-dark dark:text-white hover:border-paw-forest'}`}>
            {busySlot === slot ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : given ? <Check className="w-3.5 h-3.5" />
              : <span className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-50" />}
            {label}{given && givenAt(slot) && <span className="font-medium opacity-80">· {givenAt(slot)}</span>}
          </button>
        );
      })}
    </div>
  );
};

// ── Medication card ──────────────────────────────────────────────────────────

const MedicationCard: React.FC<{ med: Medication; onEdit: () => void }> = ({ med, onEdit }) => {
  const s = med.schedule;
  const doneToday = s.dueToday > 0 && s.remainingToday === 0;

  return (
    <div className={`card card-interactive p-6 space-y-4 ${doneToday ? 'ring-2 ring-emerald-300/80 dark:ring-emerald-700/60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 flex items-center justify-center flex-shrink-0">
            <Pill className="w-5 h-5" />
            {doneToday && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-paw-darkcard animate-pop"><Check className="w-3 h-3" /></span>}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-paw-dark dark:text-white">{med.name}{med.dosage && <span className="font-semibold text-paw-secondary dark:text-paw-warm-sage"> · {med.dosage}</span>}</h3>
            <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">
              {s.frequencyLabel}
              {med.instructions && ` · ${med.instructions}`}
            </p>
            <p className="text-[11px] text-paw-secondary/80 dark:text-paw-warm-sage/70 mt-0.5">
              Since {formatDateKey(med.startDate)}
              {med.endDate ? ` · until ${formatDateKey(med.endDate)}${s.endsInDays !== null && s.endsInDays >= 0 && s.endsInDays <= 3 ? ` (${s.endsInDays === 0 ? 'last day' : `${s.endsInDays}d left`})` : ''}` : ' · ongoing'}
              {med.prescribedBy && ` · ${med.prescribedBy}`}
            </p>
          </div>
        </div>
        <button onClick={onEdit} title="Edit or remove" aria-label={`Edit ${med.name}`} className="icon-btn -mr-2 -mt-1">
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {(s.dueToday > 0 || med.frequency === 'as_needed') ? (
        <DoseChecklist med={med} />
      ) : (
        <p className="text-xs font-semibold text-paw-secondary dark:text-paw-warm-sage">No dose due today.</p>
      )}

      {med.frequency !== 'as_needed' && (
        <div className="pt-4 border-t border-paw-line dark:border-paw-darkborder space-y-3">
          {/* 14-day grid: green = all given, amber = some, red = missed, faint = not due */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-paw-secondary dark:text-paw-warm-sage mb-1.5">
              <span>Last 14 days</span>
              {s.streak > 0 && <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"><Flame className="w-3.5 h-3.5" />{s.streak}-day streak</span>}
            </div>
            <div className="flex gap-1">
              {s.history.map((day) => {
                const isToday = day.date === todayKey();
                const cls = day.due === 0 ? 'bg-paw-soft-sage/40 dark:bg-paw-darkborder/60'
                  : day.given >= day.due ? 'bg-emerald-500'
                  : isToday ? 'bg-white dark:bg-paw-darksurface border-2 border-dashed border-paw-forest/50'
                  : day.given > 0 ? 'bg-amber-400' : 'bg-rose-400';
                return (
                  <span key={day.date} className={`flex-1 h-5 rounded-md ${cls}`}
                    title={`${formatDateKey(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}: ${day.due === 0 ? 'not due' : `${day.given}/${day.due} given`}`} />
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([['7 days', s.adherence7], ['30 days', s.adherence30]] as const).map(([label, pct]) => (
              <div key={label}>
                <div className="flex justify-between text-[11px] font-semibold text-paw-secondary dark:text-paw-warm-sage mb-1">
                  <span>On time · {label}</span><span className="font-extrabold text-paw-dark dark:text-white">{pct === null ? '—' : `${pct}%`}</span>
                </div>
                <div className="h-2 rounded-full bg-paw-soft-sage/50 dark:bg-paw-darkborder overflow-hidden">
                  <div className={`h-full rounded-full ${adherenceColor(pct)}`} style={{ width: `${pct ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Tab ──────────────────────────────────────────────────────────────────────

export const MedicationsTab: React.FC<{ pet: Pet }> = ({ pet }) => {
  const { medications, medicationsLoading } = useAppStore();
  const [editing, setEditing] = useState<Medication | 'new' | null>(null);
  const [showFinished, setShowFinished] = useState(false);

  const petMeds = medications.filter((m) => m.petId === pet.id);
  const active = petMeds.filter((m) => m.schedule.active);
  const finished = petMeds.filter((m) => !m.schedule.active);
  const dueToday = active.reduce((sum, m) => sum + m.schedule.dueToday, 0);
  const givenToday = active.reduce((sum, m) => sum + Math.min(m.schedule.givenToday.length, m.schedule.dueToday), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader icon={Pill} tone="violet" eyebrow="Medications" title="Today's doses & schedule"
        description="Tick off each dose as you give it. Doses still due show up in the reminder bell and your daily email."
        actions={<button onClick={() => setEditing('new')} className="btn-primary"><Plus className="w-4 h-4" /> Add medication</button>} />

      {dueToday > 0 && (
        <div className={`flex items-center gap-5 p-5 rounded-3xl border ${givenToday >= dueToday ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20'}`}>
          <ProgressRing value={(givenToday / dueToday) * 100} size={64} stroke={7} className={givenToday >= dueToday ? 'stroke-emerald-500' : 'stroke-violet-500'} trackClassName="stroke-white dark:stroke-white/10">
            <span className="text-sm font-extrabold text-paw-dark dark:text-white">{givenToday}/{dueToday}</span>
          </ProgressRing>
          <div className="flex-1">
            <div className="text-sm font-bold text-paw-dark dark:text-white">{givenToday >= dueToday ? `All of ${pet.name}'s doses are done for today 🎉` : `doses given today for ${pet.name}`}</div>
            <div className="text-xs text-paw-secondary dark:text-paw-warm-sage mt-0.5">{givenToday >= dueToday ? 'Great job — see you tomorrow.' : `${dueToday - givenToday} still to give. Tap a dose below once it's given.`}</div>
          </div>
        </div>
      )}

      {active.length === 0 ? (
        medicationsLoading ? (
          <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>
        ) : (
          <EmptyState icon={Pill} tone="violet" image="/images/pug-sweater.webp" title={`No current medications for ${pet.name}`}
            text="Add a course (dose, how often, start and end dates) and PawPrint will build a daily checklist and remind you."
            action={<button onClick={() => setEditing('new')} className="btn-primary"><Plus className="w-4 h-4" /> Add medication</button>} />
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 stagger">
          {active.map((med) => <MedicationCard key={med.id} med={med} onEdit={() => setEditing(med)} />)}
        </div>
      )}

      {finished.length > 0 && (
        <div>
          <button onClick={() => setShowFinished((v) => !v)} className="inline-flex items-center gap-1.5 text-sm font-bold text-paw-forest dark:text-paw-sage hover:underline">
            {showFinished ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Past &amp; upcoming courses ({finished.length})
          </button>
          {showFinished && (
            <ul className="mt-3 space-y-2">
              {finished.map((med) => (
                <li key={med.id} className="card flex items-center justify-between gap-3 p-4 text-sm">
                  <div>
                    <span className="font-bold text-paw-dark dark:text-white">{med.name}</span>
                    <span className="text-paw-secondary dark:text-paw-warm-sage"> · {med.schedule.frequencyLabel} · {formatDateKey(med.startDate)} – {med.endDate ? formatDateKey(med.endDate) : 'ongoing'}</span>
                    {med.schedule.adherence30 !== null && <span className="text-xs text-paw-secondary dark:text-paw-warm-sage"> · {med.schedule.adherence30}% on time</span>}
                  </div>
                  <button onClick={() => setEditing(med)} aria-label={`Edit ${med.name}`} className="p-1.5 rounded-full text-paw-secondary hover:text-paw-forest"><Pencil className="w-3.5 h-3.5" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {editing && <MedicationFormModal pet={pet} medication={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  );
};
