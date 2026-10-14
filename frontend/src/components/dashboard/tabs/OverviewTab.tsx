import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Syringe, Pill, Scale, Calendar, Wallet, FileText, Camera, Loader2, Pencil, Share2, FileDown, Siren,
  ArrowRight, CheckCircle2, AlertCircle, Clock3, TrendingUp, TrendingDown, Minus, Sparkles, Cpu, Plus, Heart,
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { DEFAULT_PREFERENCES, Reminder } from '../../../types';
import { formatMoney } from '../../../lib/money';
import { todayKey } from '../../../lib/dates';
import { SECTIONS, TONES, type DashboardTab } from '../../../lib/navigation';
import { CountUp, IconTile, PetAvatar, ProgressRing } from '../../ui';
import { DoseChecklist } from '../MedicationsTab';
import type { TabProps } from './types';

const REMINDER_TAB: Record<Reminder['type'], DashboardTab> = {
  vaccination: 'vaccinations',
  medication: 'medications',
  weight: 'weight-tracking',
  appointment: 'vet-appointments',
};

const URGENCY: Record<Reminder['urgency'], { dot: string; label: string; cls: string }> = {
  urgent: { dot: 'bg-rose-500', label: 'Urgent', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  upcoming: { dot: 'bg-amber-500', label: 'Soon', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  info: { dot: 'bg-sky-500', label: 'Tip', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

// Tiny line chart for the weight tile
const Sparkline: React.FC<{ values: number[] }> = ({ values }) => {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / range) * 24}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" className="w-full h-8 mt-2" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-amber-500" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export const OverviewTab: React.FC<TabProps> = ({ pet, goTo, onEditPet, onShare }) => {
  const {
    user, vaccinations, medications, weightRecords, appointments, expenses, reminders, timeline, uploadPetPhoto, showToast,
  } = useAppStore();
  const photoRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const currency = user?.preferences?.currency ?? DEFAULT_PREFERENCES.currency;

  const petVax = vaccinations.filter((v) => v.petId === pet.id);
  const overdueVax = petVax.filter((v) => v.status === 'overdue').length;
  const upToDateVax = petVax.filter((v) => v.status === 'completed').length;

  const activeMeds = medications.filter((m) => m.petId === pet.id && m.schedule.active);
  const medsToday = activeMeds.filter((m) => m.schedule.dueToday > 0 || m.frequency === 'as_needed');
  const dosesDue = activeMeds.reduce((s, m) => s + m.schedule.dueToday, 0);
  const dosesGiven = activeMeds.reduce((s, m) => s + Math.min(m.schedule.givenToday.length, m.schedule.dueToday), 0);

  const weights = weightRecords[pet.id] || [];
  const latest = weights[weights.length - 1];

  const now = Date.now();
  const upcomingVisits = appointments
    .filter((a) => a.petId === pet.id && a.status === 'upcoming' && new Date(a.dateISO).getTime() >= now - 60 * 60 * 1000)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const nextVisit = upcomingVisits[0];
  const daysToVisit = nextVisit ? Math.max(0, Math.ceil((new Date(nextVisit.dateISO).getTime() - now) / 86_400_000)) : null;

  const month = todayKey().slice(0, 7);
  const spentThisMonth = expenses.filter((e) => e.petId === pet.id && e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0);

  const petReminders = reminders.filter((r) => r.petId === pet.id);
  const attention = [...petReminders].sort((a, b) => {
    const rank = { urgent: 0, upcoming: 1, info: 2 } as const;
    return rank[a.urgency] - rank[b.urgency] || (a.daysUntil ?? 99) - (b.daysUntil ?? 99);
  });
  const recent = timeline.filter((t) => t.petId === pet.id).slice(0, 5);

  // Simple wellness score from things the owner controls
  const score = Math.round(
    (petVax.length ? (upToDateVax / petVax.length) * 35 : 15)
    + (dosesDue ? (dosesGiven / dosesDue) * 25 : 25)
    + (weights.length ? 20 : 5)
    + (petReminders.filter((r) => r.urgency === 'urgent').length === 0 ? 20 : 5),
  );

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

  const whenLabel = (r: Reminder) => {
    if (r.daysUntil === null) return r.type === 'weight' ? 'This week' : '';
    if (r.daysUntil < 0) return `${Math.abs(r.daysUntil)}d overdue`;
    if (r.daysUntil === 0) return 'Today';
    if (r.daysUntil === 1) return 'Tomorrow';
    return `In ${r.daysUntil}d`;
  };

  const trend = latest?.trendPercent ?? null;

  return (
    <div className="space-y-6 stagger">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-paw-forest via-[#1B5E49] to-paw-deep text-white shadow-soft-xl">
        <div className="absolute inset-0 bg-paw-pattern opacity-30" aria-hidden />
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl animate-blob" aria-hidden />
        <div className="absolute -left-10 -bottom-24 w-72 h-72 rounded-full bg-teal-200/10 blur-3xl animate-blob" style={{ animationDelay: '-6s' }} aria-hidden />
        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0">
            <div className="absolute -inset-1.5 rounded-[2rem] bg-gradient-to-br from-emerald-200/60 to-amber-200/40 blur-sm" aria-hidden />
            <PetAvatar pet={pet} className="relative w-full h-full !rounded-[1.75rem] ring-4 ring-white/20" />
            <button type="button" onClick={() => photoRef.current?.click()} disabled={uploading}
              aria-label={pet.hasCustomPhoto ? 'Change photo' : 'Upload a photo'} title={pet.hasCustomPhoto ? 'Change photo' : 'Upload a photo'}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white text-paw-forest flex items-center justify-center shadow-soft-lg hover:scale-110 transition-transform disabled:opacity-70">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-100/90">{greeting()}{user ? `, ${user.name.split(' ')[0]}` : ''} 👋</p>
            <h2 className="mt-1 font-display text-4xl sm:text-5xl font-semibold tracking-tight">{pet.name}</h2>
            <p className="mt-1 text-sm text-emerald-50/85">
              {[pet.breed || (pet.species === 'cat' ? 'Cat' : pet.species === 'dog' ? 'Dog' : 'Pet'), pet.age, pet.gender].filter(Boolean).join(' · ')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pet.weight > 0 && <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold">⚖️ {pet.weight} kg</span>}
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold inline-flex items-center gap-1"><Cpu className="w-3 h-3" />{pet.microchipId ? 'Microchipped' : 'No microchip yet'}</span>
              {pet.allergies.length > 0 && <span className="px-3 py-1 rounded-full bg-rose-400/25 text-xs font-bold">⚠ {pet.allergies.length} allerg{pet.allergies.length === 1 ? 'y' : 'ies'}</span>}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={onEditPet} className="btn btn-sm bg-white text-paw-forest hover:bg-emerald-50 shadow-soft"><Pencil className="w-3.5 h-3.5" /> Edit profile</button>
              <button onClick={onShare} className="btn btn-sm bg-white/15 hover:bg-white/25 text-white backdrop-blur"><Share2 className="w-3.5 h-3.5" /> Share with vet</button>
              <Link to={`/pets/${pet.id}/summary`} className="btn btn-sm bg-white/15 hover:bg-white/25 text-white backdrop-blur"><FileDown className="w-3.5 h-3.5" /> Health summary</Link>
              <Link to={`/emergency?pet=${pet.id}`} className="btn btn-sm bg-rose-500 hover:bg-rose-600 text-white"><Siren className="w-3.5 h-3.5" /> Emergency</Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-2 pl-6 border-l border-white/15">
            <ProgressRing value={score} size={104} stroke={9} className="stroke-emerald-300" trackClassName="stroke-white/15">
              <div className="text-center">
                <div className="text-2xl font-extrabold"><CountUp value={score} /></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/80">Care score</div>
              </div>
            </ProgressRing>
            <span className="text-[11px] text-emerald-100/75 text-center max-w-[9rem]">Vaccines, doses, weigh-ins and open alerts</span>
          </div>
        </div>
      </section>

      {/* Key numbers */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <button onClick={() => goTo('vaccinations')} className="card card-interactive p-5 text-left">
          <div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Vaccines</span><IconTile icon={Syringe} tone="sky" size="sm" /></div>
          <div className="mt-2 text-2xl font-extrabold text-paw-dark dark:text-white"><CountUp value={upToDateVax} /><span className="text-sm font-semibold text-paw-secondary dark:text-paw-warm-sage"> / {petVax.length}</span></div>
          <div className={`mt-1 text-xs font-semibold ${overdueVax ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {petVax.length === 0 ? 'None recorded yet' : overdueVax ? `${overdueVax} overdue` : 'All up to date'}
          </div>
        </button>

        <button onClick={() => goTo('medications')} className="card card-interactive p-5 text-left">
          <div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Doses today</span><IconTile icon={Pill} tone="violet" size="sm" /></div>
          <div className="mt-2 flex items-center gap-3">
            <ProgressRing value={dosesDue ? (dosesGiven / dosesDue) * 100 : 0} size={40} stroke={5} className="stroke-violet-500" />
            <div className="text-2xl font-extrabold text-paw-dark dark:text-white">{dosesGiven}<span className="text-sm font-semibold text-paw-secondary dark:text-paw-warm-sage">/{dosesDue}</span></div>
          </div>
          <div className="mt-1 text-xs font-semibold text-paw-secondary dark:text-paw-warm-sage">{activeMeds.length ? `${activeMeds.length} active course${activeMeds.length === 1 ? '' : 's'}` : 'No medications'}</div>
        </button>

        <button onClick={() => goTo('weight-tracking')} className="card card-interactive p-5 text-left">
          <div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Weight</span><IconTile icon={Scale} tone="amber" size="sm" /></div>
          <div className="mt-2 text-2xl font-extrabold text-paw-dark dark:text-white">{latest ? <><CountUp value={latest.weight} decimals={1} /><span className="text-sm font-semibold text-paw-secondary dark:text-paw-warm-sage"> kg</span></> : '—'}</div>
          <div className="mt-1 text-xs font-semibold text-paw-secondary dark:text-paw-warm-sage inline-flex items-center gap-1">
            {trend === null ? (latest ? 'First weigh-in' : 'No weigh-ins yet') : <>{trend > 0.4 ? <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> : trend < -0.4 ? <TrendingDown className="w-3.5 h-3.5 text-sky-600" /> : <Minus className="w-3.5 h-3.5" />}{Math.abs(trend)}% vs last</>}
          </div>
          <Sparkline values={weights.slice(-8).map((w) => w.weight)} />
        </button>

        <button onClick={() => goTo('vet-appointments')} className="card card-interactive p-5 text-left">
          <div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Next visit</span><IconTile icon={Calendar} tone="teal" size="sm" /></div>
          <div className="mt-2 text-2xl font-extrabold text-paw-dark dark:text-white">{daysToVisit === null ? '—' : daysToVisit === 0 ? 'Today' : <>{daysToVisit}<span className="text-sm font-semibold text-paw-secondary dark:text-paw-warm-sage"> day{daysToVisit === 1 ? '' : 's'}</span></>}</div>
          <div className="mt-1 text-xs font-semibold text-paw-secondary dark:text-paw-warm-sage truncate">{nextVisit ? `${nextVisit.date} · ${nextVisit.clinicName}` : 'Nothing booked'}</div>
        </button>

        <button onClick={() => goTo('expenses')} className="card card-interactive p-5 text-left col-span-2 md:col-span-1">
          <div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">This month</span><IconTile icon={Wallet} tone="rose" size="sm" /></div>
          <div className="mt-2 text-2xl font-extrabold text-paw-dark dark:text-white truncate"><CountUp value={spentThisMonth} format={(n) => formatMoney(n, currency)} /></div>
          <div className="mt-1 text-xs font-semibold text-paw-secondary dark:text-paw-warm-sage">Spent on {pet.name}</div>
        </button>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Needs attention */}
        <section className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <IconTile icon={Sparkles} tone="orange" size="sm" />
              <h3 className="text-base font-extrabold text-paw-dark dark:text-white">Needs attention</h3>
            </div>
            <button onClick={() => goTo('reminders')} className="text-xs font-bold text-paw-forest dark:text-paw-sage hover:underline inline-flex items-center gap-1">All reminders <ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          {attention.length === 0 ? (
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-emerald-900 dark:text-emerald-200">{pet.name} is all caught up!</p>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">Nothing overdue or due in the next {user?.preferences?.reminderLeadDays ?? DEFAULT_PREFERENCES.reminderLeadDays} days.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {attention.slice(0, 5).map((r) => {
                const tab = REMINDER_TAB[r.type];
                const s = SECTIONS[tab];
                return (
                  <li key={r.id}>
                    <button onClick={() => goTo(tab)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-paw-mist dark:hover:bg-paw-darksurface text-left transition-colors group">
                      <span className="relative">
                        <IconTile icon={s.icon} tone={s.tone} size="sm" />
                        <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-paw-darkcard ${URGENCY[r.urgency].dot}`} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-paw-dark dark:text-white truncate">{r.title}</span>
                        <span className="block text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{r.message}</span>
                      </span>
                      {whenLabel(r) && <span className={`badge ${URGENCY[r.urgency].cls}`}>{whenLabel(r)}</span>}
                      <ArrowRight className="w-4 h-4 text-paw-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section className="card p-6">
          <h3 className="text-base font-extrabold text-paw-dark dark:text-white mb-4">Quick add</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {([
              ['weight-tracking', 'Log weight'],
              ['vaccinations', 'Add vaccine'],
              ['vet-appointments', 'Book visit'],
              ['medications', 'Add medication'],
              ['expenses', 'Add expense'],
              ['medical-documents', 'Upload file'],
            ] as [DashboardTab, string][]).map(([tab, label]) => {
              const s = SECTIONS[tab];
              const Icon = s.icon;
              return (
                <button key={tab} onClick={() => goTo(tab)}
                  className={`group flex flex-col items-start gap-2 p-3.5 rounded-2xl ${TONES[s.tone].soft} hover:shadow-soft hover:-translate-y-0.5 transition-all text-left`}>
                  <span className={`w-8 h-8 rounded-xl bg-white dark:bg-paw-darkcard flex items-center justify-center shadow-2xs ${TONES[s.tone].text} group-hover:scale-110 transition-transform`}><Icon className="w-4 h-4" /></span>
                  <span className="text-xs font-bold text-paw-dark dark:text-white inline-flex items-center gap-1"><Plus className="w-3 h-3" />{label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Today's doses */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <IconTile icon={Pill} tone="violet" size="sm" />
              <h3 className="text-base font-extrabold text-paw-dark dark:text-white">Today's doses</h3>
            </div>
            <button onClick={() => goTo('medications')} className="text-xs font-bold text-paw-forest dark:text-paw-sage hover:underline inline-flex items-center gap-1">Medications <ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          {medsToday.length === 0 ? (
            <p className="text-sm text-paw-secondary dark:text-paw-warm-sage py-6 text-center">No doses due today. <button onClick={() => goTo('medications')} className="font-bold text-paw-forest dark:text-paw-sage hover:underline">Add a medication</button> to get a daily checklist.</p>
          ) : (
            <ul className="space-y-4">
              {medsToday.slice(0, 4).map((m) => (
                <li key={m.id} className="space-y-2">
                  <div className="text-sm font-bold text-paw-dark dark:text-white">{m.name}{m.dosage && <span className="font-medium text-paw-secondary dark:text-paw-warm-sage"> · {m.dosage}</span>}</div>
                  <DoseChecklist med={m} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming visits + recent activity */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <IconTile icon={Clock3} tone="slate" size="sm" />
              <h3 className="text-base font-extrabold text-paw-dark dark:text-white">Coming up & recent</h3>
            </div>
            <button onClick={() => goTo('health-timeline')} className="text-xs font-bold text-paw-forest dark:text-paw-sage hover:underline inline-flex items-center gap-1">Timeline <ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          <ul className="space-y-1">
            {upcomingVisits.slice(0, 2).map((a) => (
              <li key={a.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-teal-50/70 dark:bg-teal-500/10">
                <div className="w-12 text-center flex-shrink-0">
                  <div className="text-[10px] font-extrabold uppercase text-teal-700 dark:text-teal-300">{new Date(a.dateISO).toLocaleDateString(undefined, { month: 'short' })}</div>
                  <div className="text-xl font-extrabold text-paw-dark dark:text-white leading-none">{new Date(a.dateISO).getDate()}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-paw-dark dark:text-white truncate">{a.reason}</div>
                  <div className="text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{a.time} · {a.clinicName}</div>
                </div>
              </li>
            ))}
            {recent.map((t) => {
              const icon = t.category === 'vaccination' ? Syringe : t.category === 'weight' ? Scale : t.category === 'appointment' ? Calendar : FileText;
              const tone = t.category === 'vaccination' ? 'sky' : t.category === 'weight' ? 'amber' : t.category === 'appointment' ? 'teal' : 'indigo';
              return (
                <li key={t.id} className="flex items-center gap-3 p-2.5">
                  <IconTile icon={icon} tone={tone} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-paw-dark dark:text-white truncate">{t.title}</div>
                    <div className="text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{t.date}</div>
                  </div>
                </li>
              );
            })}
            {upcomingVisits.length === 0 && recent.length === 0 && (
              <li className="text-sm text-paw-secondary dark:text-paw-warm-sage py-6 text-center flex flex-col items-center gap-2">
                <Heart className="w-6 h-6 text-rose-400" />
                {pet.name}'s story starts here — log a vaccine, weigh-in or visit.
              </li>
            )}
          </ul>
        </section>
      </div>

      {overdueVax > 0 && (
        <button onClick={() => goTo('vaccinations')} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-left hover:shadow-soft transition-shadow">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span className="flex-1 text-sm font-semibold text-rose-900 dark:text-rose-200">{overdueVax} vaccination{overdueVax === 1 ? ' is' : 's are'} overdue — book a booster soon.</span>
          <ArrowRight className="w-4 h-4 text-rose-600" />
        </button>
      )}
    </div>
  );
};
