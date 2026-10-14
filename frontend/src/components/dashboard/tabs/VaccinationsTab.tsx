import React, { useEffect, useState } from 'react';
import { Syringe, Plus, CheckCircle2, Clock3, AlertCircle, Pencil, Lightbulb, Loader2 } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useDraft } from '../../../lib/useDraft';
import { apiRequest } from '../../../lib/api';
import { addMonthsToKey, formatDateKey, todayKey } from '../../../lib/dates';
import { Vaccination, VaccineSuggestion } from '../../../types';
import { Modal } from '../../common/Modal';
import { EditVaccinationModal } from '../RecordEditModals';
import { EmptyState, SectionHeader, Segmented, StatTile } from '../../ui';
import type { TabProps } from './types';

type Catalog = { species: string; vaccines: VaccineSuggestion[]; disclaimer: string };
type Filter = 'all' | 'completed' | 'upcoming' | 'overdue';

const STATUS = {
  completed: { label: 'Up to date', icon: CheckCircle2, badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300', bar: 'bg-emerald-500', edge: 'before:bg-emerald-500' },
  upcoming: { label: 'Due soon', icon: Clock3, badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300', bar: 'bg-amber-500', edge: 'before:bg-amber-500' },
  overdue: { label: 'Overdue', icon: AlertCircle, badge: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300', bar: 'bg-rose-500', edge: 'before:bg-rose-500' },
} as const;

const dayDiff = (key: string) => Math.round((new Date(`${key}T00:00:00`).getTime() - new Date(`${todayKey()}T00:00:00`).getTime()) / 86_400_000);

const AddVaccinationModal: React.FC<{ petId: string; species: string; petName: string; onClose: () => void }> = ({ petId, species, petName, onClose }) => {
  const { addVaccination, showToast, token } = useAppStore();
  const draft = useDraft(`vaccination-${petId}`, { name: '', adminDate: '', nextDue: '', vet: '', clinic: '', batch: '' });
  const { name, adminDate, nextDue, vet, clinic, batch } = draft.value;
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [saving, setSaving] = useState(false);

  // Common vaccines for this species, to suggest names and booster intervals
  useEffect(() => {
    apiRequest<Catalog>(`/vaccinations/catalog?species=${species}`, { token }).then(setCatalog).catch(() => {});
  }, [species, token]);

  const suggestion = catalog?.vaccines.find((v) => v.name.toLowerCase() === name.trim().toLowerCase());
  const suggestNextDue = (n: string, given: string) => {
    const match = catalog?.vaccines.find((v) => v.name.toLowerCase() === n.trim().toLowerCase());
    if (match && given) draft.update({ nextDue: addMonthsToKey(given, match.intervalMonths) });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast('⚠️ Please enter the vaccine name.'); return; }
    if (!adminDate) { showToast('⚠️ Please select the date this vaccine was given.'); return; }
    if (!nextDue) { showToast('⚠️ Please set the next due date so we can send you a reminder.'); return; }
    if (nextDue < adminDate) { showToast('⚠️ The next due date must be after the date it was given.'); return; }
    setSaving(true);
    try {
      await addVaccination(petId, {
        vaccineName: name.trim(), administrationDate: adminDate, nextDueDate: nextDue,
        veterinarian: vet || undefined, clinic: clinic || undefined, batchNumber: batch || undefined,
      });
      draft.clear();
      onClose();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not save vaccination — please try again.'}`);
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Add vaccination" subtitle={`New immunisation record for ${petName}`} icon={Syringe} tone="sky" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="vax-name">Vaccine *</label>
          <input id="vax-name" required value={name} list="vaccine-suggestions" className="input" placeholder="Start typing, e.g. Rabies"
            onChange={(e) => { draft.update({ name: e.target.value }); suggestNextDue(e.target.value, adminDate); }} />
          <datalist id="vaccine-suggestions">
            {catalog?.vaccines.map((v) => <option key={v.name} value={v.name}>{v.core ? 'Core vaccine' : 'Lifestyle vaccine'}</option>)}
          </datalist>
          {catalog && !name && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {catalog.vaccines.slice(0, 5).map((v) => (
                <button key={v.name} type="button" onClick={() => { draft.update({ name: v.name }); suggestNextDue(v.name, adminDate); }} className="chip">{v.name}</button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="vax-given">Date given *</label>
            <input id="vax-given" required type="date" value={adminDate} max={todayKey()} className="input"
              onChange={(e) => { draft.update({ adminDate: e.target.value }); suggestNextDue(name, e.target.value); }} />
          </div>
          <div>
            <label className="label" htmlFor="vax-due">Next due *</label>
            <input id="vax-due" required type="date" value={nextDue} min={adminDate || undefined} className="input" onChange={(e) => draft.update({ nextDue: e.target.value })} />
          </div>
        </div>
        {suggestion && (
          <p className="flex gap-2 p-3 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-xs text-sky-900 dark:text-sky-200">
            <Lightbulb className="w-4 h-4 flex-shrink-0" />
            <span><strong>{suggestion.core ? 'Core vaccine.' : 'Lifestyle vaccine.'}</strong> {suggestion.description} Next due was set to the usual {suggestion.intervalMonths} months — {catalog?.disclaimer.toLowerCase()}</span>
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="label" htmlFor="vax-vet">Veterinarian</label><input id="vax-vet" value={vet} onChange={(e) => draft.update({ vet: e.target.value })} className="input" placeholder="Optional" /></div>
          <div><label className="label" htmlFor="vax-clinic">Clinic</label><input id="vax-clinic" value={clinic} onChange={(e) => draft.update({ clinic: e.target.value })} className="input" placeholder="Optional" /></div>
          <div><label className="label" htmlFor="vax-batch">Batch no.</label><input id="vax-batch" value={batch} onChange={(e) => draft.update({ batch: e.target.value })} className="input" placeholder="Optional" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save vaccination'}</button>
        </div>
      </form>
    </Modal>
  );
};

export const VaccinationsTab: React.FC<TabProps> = ({ pet }) => {
  const { vaccinations, vaccinationsLoading } = useAppStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Vaccination | null>(null);

  const petVax = vaccinations.filter((v) => v.petId === pet.id);
  const counts = {
    completed: petVax.filter((v) => v.status === 'completed').length,
    upcoming: petVax.filter((v) => v.status === 'upcoming').length,
    overdue: petVax.filter((v) => v.status === 'overdue').length,
  };
  // Most urgent first: overdue, then due soonest
  const shown = petVax
    .filter((v) => filter === 'all' || v.status === filter)
    .sort((a, b) => (a.nextDueDate || '').localeCompare(b.nextDueDate || ''));

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader icon={Syringe} tone="sky" eyebrow="Vaccinations" title="Immunisation record"
        description={`Every shot ${pet.name} has had and when the next booster is due. Boosters due within 30 days show as “due soon”.`}
        actions={<button onClick={() => setAdding(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add vaccination</button>} />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile label="Up to date" value={counts.completed} icon={CheckCircle2} tone="forest" onClick={() => setFilter('completed')} />
        <StatTile label="Due soon" value={counts.upcoming} icon={Clock3} tone="amber" onClick={() => setFilter('upcoming')} />
        <StatTile label="Overdue" value={counts.overdue} icon={AlertCircle} tone="rose" onClick={() => setFilter('overdue')} />
      </div>

      {petVax.length > 0 && (
        <Segmented<Filter> label="Filter vaccinations" value={filter} onChange={setFilter} options={[
          { value: 'all', label: `All (${petVax.length})` },
          { value: 'completed', label: 'Up to date' },
          { value: 'upcoming', label: 'Due soon' },
          { value: 'overdue', label: 'Overdue' },
        ]} />
      )}

      {petVax.length === 0 ? (
        <EmptyState icon={Syringe} tone="sky" title={vaccinationsLoading ? 'Loading vaccinations…' : 'No vaccinations recorded yet'}
          image="/images/vet-care.webp"
          text={`Log ${pet.name}'s first immunisation and PawPrint will track every booster and remind you before it's due.`}
          action={<button onClick={() => setAdding(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add vaccination</button>} />
      ) : shown.length === 0 ? (
        <EmptyState icon={Syringe} tone="sky" title="Nothing in this filter" action={<button onClick={() => setFilter('all')} className="btn-secondary">Show all</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {shown.map((vac) => {
            const st = STATUS[vac.status];
            const Icon = st.icon;
            const total = vac.administeredDate && vac.nextDueDate ? Math.max(1, dayDiff(vac.nextDueDate) - dayDiff(vac.administeredDate)) : 1;
            const left = vac.nextDueDate ? dayDiff(vac.nextDueDate) : 0;
            const elapsedPct = Math.min(100, Math.max(0, ((total - left) / total) * 100));
            return (
              <article key={vac.id}
                className={`card card-interactive relative overflow-hidden p-5 pl-6 before:absolute before:left-0 before:inset-y-0 before:w-1.5 ${st.edge}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className={`badge ${st.badge}`}><Icon className="w-3 h-3" />{st.label}</span>
                    <h3 className="mt-2 text-base font-extrabold text-paw-dark dark:text-white">{vac.name}</h3>
                    <p className="text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{[vac.clinic, vac.veterinarian].filter(Boolean).join(' · ') || 'Clinic not recorded'}</p>
                  </div>
                  <button onClick={() => setEditing(vac)} title="Edit or delete" aria-label={`Edit ${vac.name}`} className="icon-btn -mr-2 -mt-1"><Pencil className="w-4 h-4" /></button>
                </div>
                <div className="mt-4">
                  <div className="h-1.5 rounded-full bg-paw-mist dark:bg-paw-darksurface overflow-hidden">
                    <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${elapsedPct}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px]">
                    <span className="text-paw-secondary dark:text-paw-warm-sage">Given {vac.administeredDate ? formatDateKey(vac.administeredDate) : '—'}</span>
                    <span className={`font-bold ${vac.status === 'overdue' ? 'text-rose-600 dark:text-rose-400' : 'text-paw-dark dark:text-white'}`}>
                      {left < 0 ? `${Math.abs(left)}d overdue` : left === 0 ? 'Due today' : `Due in ${left}d`}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-paw-line dark:border-paw-darkborder flex justify-between text-xs">
                  <span className="text-paw-secondary dark:text-paw-warm-sage">Next due</span>
                  <span className="font-bold text-paw-dark dark:text-white">{vac.nextDueDate ? formatDateKey(vac.nextDueDate) : '—'}</span>
                </div>
                {vac.batchNumber && <div className="mt-1 text-[11px] text-paw-secondary dark:text-paw-warm-sage">Batch {vac.batchNumber}</div>}
              </article>
            );
          })}
        </div>
      )}

      {adding && <AddVaccinationModal petId={pet.id} species={pet.species} petName={pet.name} onClose={() => setAdding(false)} />}
      {editing && <EditVaccinationModal vaccination={editing} onClose={() => setEditing(null)} />}
    </div>
  );
};
