import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Plus, Pencil, MapPin, CalendarPlus, Check, X, Loader2, Receipt, StickyNote } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useDraft } from '../../../lib/useDraft';
import { downloadAppointmentIcs } from '../../../lib/calendar';
import { formatMoney } from '../../../lib/money';
import { isoToDateKey, todayKey } from '../../../lib/dates';
import { Appointment } from '../../../types';
import { Modal } from '../../common/Modal';
import { EditAppointmentModal } from '../RecordEditModals';
import { ExpenseFormModal, ExpensePrefill } from '../ExpensesTab';
import { EmptyState, SectionHeader, Segmented } from '../../ui';
import type { TabProps } from './types';

type View = 'upcoming' | 'past' | 'cancelled';

const BookModal: React.FC<{ petId: string; petName: string; onClose: () => void }> = ({ petId, petName, onClose }) => {
  const { bookAppointment, clinics, showToast } = useAppStore();
  const draft = useDraft(`appointment-${petId}`, { clinic: '', date: '', reason: '', notes: '' });
  const { clinic, date, reason, notes } = draft.value;
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic.trim()) { showToast('⚠️ Please enter the clinic or hospital name.'); return; }
    if (!date) { showToast('⚠️ Please pick a date and time for the appointment.'); return; }
    setSaving(true);
    try {
      const match = clinics.find((c) => c.name.toLowerCase() === clinic.trim().toLowerCase());
      await bookAppointment({ pet: petId, clinicName: clinic.trim(), clinicAddress: match?.address, date, reason: reason || undefined, notes: notes || undefined });
      draft.clear();
      onClose();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not book appointment — please try again.'}`);
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Book a vet visit" subtitle={`For ${petName}`} icon={Calendar} tone="teal" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="apt-clinic">Clinic or hospital *</label>
          <input id="apt-clinic" required value={clinic} list="clinic-suggestions" onChange={(e) => draft.update({ clinic: e.target.value })} placeholder="e.g. City Vet Hospital" className="input" />
          <datalist id="clinic-suggestions">{clinics.map((c) => <option key={c.id} value={c.name}>{c.address}</option>)}</datalist>
        </div>
        <div>
          <label className="label" htmlFor="apt-date">Date & time *</label>
          <input id="apt-date" required type="datetime-local" value={date} onChange={(e) => draft.update({ date: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="apt-reason">Reason</label>
          <input id="apt-reason" value={reason} onChange={(e) => draft.update({ reason: e.target.value })} placeholder="e.g. Annual checkup, booster" className="input" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {['Annual checkup', 'Vaccination', 'Dental cleaning', 'Grooming', 'Follow-up'].map((r) => (
              <button key={r} type="button" onClick={() => draft.update({ reason: r })} className={`chip ${reason === r ? 'chip-active' : ''}`}>{r}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="apt-notes">Notes</label>
          <textarea id="apt-notes" rows={2} value={notes} onChange={(e) => draft.update({ notes: e.target.value })} placeholder="Symptoms to mention, records to bring…" className="input resize-none" />
        </div>
        <p className="text-[11px] text-paw-secondary dark:text-paw-warm-sage">If email reminders are on, you'll get a confirmation with a calendar invite.</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</> : 'Confirm booking'}</button>
        </div>
      </form>
    </Modal>
  );
};

export const AppointmentsTab: React.FC<TabProps> = ({ pet }) => {
  const { appointments, expenses, user, updateAppointment, showToast } = useAppStore();
  const [view, setView] = useState<View>('upcoming');
  const [booking, setBooking] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [costFor, setCostFor] = useState<ExpensePrefill | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();

  // ?book=1 (from "Book here" on a clinic) opens the booking form straight away
  useEffect(() => {
    if (params.get('book') !== '1') return;
    setBooking(true);
    setParams((prev) => { const next = new URLSearchParams(prev); next.delete('book'); return next; }, { replace: true });
  }, [params, setParams]);

  const petApts = appointments.filter((a) => a.petId === pet.id);
  const upcoming = petApts.filter((a) => a.status === 'upcoming').sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const past = petApts.filter((a) => a.status === 'completed').sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  const cancelled = petApts.filter((a) => a.status === 'cancelled').sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  const shown = view === 'upcoming' ? upcoming : view === 'past' ? past : cancelled;

  const setStatus = async (apt: Appointment, status: 'completed' | 'cancelled') => {
    if (status === 'cancelled' && !window.confirm(`Cancel the appointment at ${apt.clinicName} on ${apt.date}?`)) return;
    setBusy(apt.id);
    try {
      await updateAppointment(apt.id, { status });
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not update appointment — please try again.'}`);
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader icon={Calendar} tone="teal" eyebrow="Appointments" title="Vet visits"
        description="Book visits, add them to your calendar, and log what each one cost once it's done."
        actions={<button onClick={() => setBooking(true)} className="btn-primary"><Plus className="w-4 h-4" /> Book appointment</button>} />

      <Segmented<View> label="Appointment status" value={view} onChange={setView} options={[
        { value: 'upcoming', label: `Upcoming (${upcoming.length})` },
        { value: 'past', label: `Completed (${past.length})` },
        { value: 'cancelled', label: `Cancelled (${cancelled.length})` },
      ]} />

      {shown.length === 0 ? (
        <EmptyState icon={Calendar} tone="teal" image={view === 'upcoming' ? '/images/dog-aussie.webp' : undefined}
          title={view === 'upcoming' ? 'No upcoming visits' : view === 'past' ? 'No completed visits yet' : 'No cancelled visits'}
          text={view === 'upcoming' ? `Schedule ${pet.name}'s next checkup — PawPrint will remind you beforehand.` : undefined}
          action={view === 'upcoming' ? <button onClick={() => setBooking(true)} className="btn-primary"><Plus className="w-4 h-4" /> Book appointment</button> : undefined} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
          {shown.map((apt) => {
            const d = new Date(apt.dateISO);
            const logged = expenses.filter((e) => e.appointmentId === apt.id);
            const isPastDue = apt.status === 'upcoming' && d.getTime() < Date.now();
            return (
              <article key={apt.id} className={`card card-interactive p-5 ${apt.status === 'cancelled' ? 'opacity-70' : ''}`}>
                <div className="flex gap-4">
                  <div className={`w-16 flex-shrink-0 rounded-2xl text-center py-2.5 ${apt.status === 'upcoming' ? 'bg-teal-50 dark:bg-teal-500/15' : 'bg-paw-mist dark:bg-paw-darksurface'}`}>
                    <div className="text-[10px] font-extrabold uppercase text-teal-700 dark:text-teal-300">{d.toLocaleDateString(undefined, { month: 'short' })}</div>
                    <div className="text-2xl font-extrabold text-paw-dark dark:text-white leading-tight">{d.getDate()}</div>
                    <div className="text-[10px] font-semibold text-paw-secondary dark:text-paw-warm-sage">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={`text-base font-extrabold text-paw-dark dark:text-white truncate ${apt.status === 'cancelled' ? 'line-through' : ''}`}>{apt.reason}</h3>
                        <p className="text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{apt.time} · {apt.clinicName}</p>
                      </div>
                      <button onClick={() => setEditing(apt)} title="Edit or delete" aria-label="Edit appointment" className="icon-btn -mr-2 -mt-1 flex-shrink-0"><Pencil className="w-4 h-4" /></button>
                    </div>
                    {isPastDue && <span className="badge mt-2 bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">Did this happen? Mark it done</span>}
                    {apt.notes && <p className="mt-2 text-xs text-paw-secondary dark:text-paw-warm-sage flex gap-1.5"><StickyNote className="w-3.5 h-3.5 flex-shrink-0 mt-px" />{apt.notes}</p>}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-paw-line dark:border-paw-darkborder flex flex-wrap items-center gap-2">
                  {apt.status === 'upcoming' && (
                    <>
                      <button onClick={() => setStatus(apt, 'completed')} disabled={busy === apt.id} className="btn btn-sm bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300"><Check className="w-3.5 h-3.5" /> Mark done</button>
                      <button onClick={() => setStatus(apt, 'cancelled')} disabled={busy === apt.id} className="btn btn-sm text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"><X className="w-3.5 h-3.5" /> Cancel</button>
                      <button onClick={() => downloadAppointmentIcs(apt, pet.name)} className="btn btn-sm text-paw-forest dark:text-paw-sage hover:bg-paw-light-sage dark:hover:bg-paw-darksurface"><CalendarPlus className="w-3.5 h-3.5" /> Calendar</button>
                    </>
                  )}
                  {apt.status === 'completed' && (logged.length ? (
                    <span className="badge bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 normal-case text-[11px]"><Receipt className="w-3 h-3" /> Cost logged: {formatMoney(logged.reduce((s, e) => s + e.amount, 0), user?.preferences?.currency)}</span>
                  ) : (
                    <button onClick={() => setCostFor({ category: 'vet', description: apt.reason, vendor: apt.clinicName, date: [isoToDateKey(apt.dateISO), todayKey()].sort()[0], appointment: apt.id })}
                      className="btn btn-sm bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300"><Receipt className="w-3.5 h-3.5" /> Log the cost</button>
                  ))}
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${apt.clinicName} ${apt.clinicAddress}`.trim())}`}
                    target="_blank" rel="noopener noreferrer" className="btn btn-sm text-paw-secondary dark:text-paw-warm-sage hover:bg-paw-mist dark:hover:bg-paw-darksurface ml-auto">
                    <MapPin className="w-3.5 h-3.5" /> Directions
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {booking && <BookModal petId={pet.id} petName={pet.name} onClose={() => setBooking(false)} />}
      {editing && <EditAppointmentModal appointment={editing} onClose={() => setEditing(null)} />}
      {costFor && <ExpenseFormModal pet={pet} prefill={costFor} onClose={() => setCostFor(null)} />}
    </div>
  );
};
