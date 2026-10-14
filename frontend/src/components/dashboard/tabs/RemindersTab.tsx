import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, AlertCircle, Clock3, Lightbulb, Mail, Loader2, BellRing, Settings as SettingsIcon, ArrowRight, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { DEFAULT_PREFERENCES, Reminder } from '../../../types';
import { NotificationToggle } from '../../common/NotificationToggle';
import { SECTIONS, type DashboardTab } from '../../../lib/navigation';
import { IconTile, PetAvatar, SectionHeader, Segmented } from '../../ui';
import type { TabProps } from './types';

const REMINDER_TAB: Record<Reminder['type'], DashboardTab> = {
  vaccination: 'vaccinations',
  medication: 'medications',
  weight: 'weight-tracking',
  appointment: 'vet-appointments',
};
const ACTION_LABEL: Record<Reminder['type'], string> = {
  vaccination: 'Open vaccinations',
  medication: 'Tick off doses',
  weight: 'Log a weight',
  appointment: 'View appointment',
};
const GROUPS: { key: Reminder['urgency']; title: string; icon: typeof Bell; cls: string; card: string }[] = [
  { key: 'urgent', title: 'Needs attention now', icon: AlertCircle, cls: 'text-rose-700 dark:text-rose-400', card: 'border-l-rose-500' },
  { key: 'upcoming', title: 'Coming up', icon: Clock3, cls: 'text-amber-700 dark:text-amber-400', card: 'border-l-amber-500' },
  { key: 'info', title: 'Good to know', icon: Lightbulb, cls: 'text-sky-700 dark:text-sky-400', card: 'border-l-sky-500' },
];

const whenLabel = (r: Reminder) => {
  if (r.daysUntil === null) return r.type === 'weight' ? 'This week' : '';
  if (r.daysUntil < 0) return r.type === 'vaccination' ? `${Math.abs(r.daysUntil)}d overdue` : `${Math.abs(r.daysUntil)}d ago`;
  if (r.daysUntil === 0) return 'Today';
  if (r.daysUntil === 1) return 'Tomorrow';
  return `In ${r.daysUntil} days`;
};

export const RemindersTab: React.FC<TabProps> = ({ pet, goTo }) => {
  const { reminders, remindersLoading, pets, user, sendTestReminderEmail, updateProfile, showToast } = useAppStore();
  const [scope, setScope] = useState<'pet' | 'all'>('pet');
  const [sending, setSending] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [result, setResult] = useState<{ msg: string; previewUrl?: string | null; delivered: boolean } | null>(null);

  const prefs = user?.preferences ?? DEFAULT_PREFERENCES;
  const shown = scope === 'all' ? reminders : reminders.filter((r) => r.petId === pet.id);
  const petCount = reminders.filter((r) => r.petId === pet.id).length;

  const sendTest = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await sendTestReminderEmail();
      setResult({ msg: res.message, previewUrl: res.previewUrl, delivered: res.delivered });
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not send the test email.'}`);
    } finally { setSending(false); }
  };

  const enableEmail = async () => {
    setEnabling(true);
    try {
      await updateProfile({ preferences: { emailReminders: true } });
      showToast('📬 Email reminders are on — you\'ll get a daily digest when something is due.');
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not update your settings.'}`);
    } finally { setEnabling(false); }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader icon={Bell} tone="orange" eyebrow="Smart reminders" title={scope === 'all' ? 'Care feed for all pets' : `${pet.name}'s care feed`}
        description={`Built from your records: vaccines due, visits to confirm, doses still due today and weigh-in nudges — looking ${prefs.reminderLeadDays} days ahead.`}
        actions={pets.length > 1 ? (
          <Segmented<'pet' | 'all'> label="Reminder scope" value={scope} onChange={setScope}
            options={[{ value: 'pet', label: `${pet.name} (${petCount})` }, { value: 'all', label: `All pets (${reminders.length})` }]} />
        ) : undefined} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {remindersLoading && shown.length === 0 ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-3xl animate-shimmer" />)}</div>
          ) : shown.length === 0 ? (
            <div className="card p-8 text-center relative overflow-hidden">
              <img src="/images/dog-samoyed.webp" alt="" className="w-28 h-28 mx-auto rounded-full object-cover shadow-soft-lg ring-4 ring-emerald-100 dark:ring-emerald-500/20 animate-float-slow" />
              <CheckCircle2 className="w-7 h-7 mx-auto mt-4 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-1 text-lg font-extrabold text-paw-dark dark:text-white">{scope === 'all' ? 'All your pets are caught up!' : `${pet.name} is all caught up!`}</p>
              <p className="text-sm text-paw-secondary dark:text-paw-warm-sage">Nothing overdue or due in the next {prefs.reminderLeadDays} days.</p>
            </div>
          ) : GROUPS.map((g) => {
            const items = shown.filter((r) => r.urgency === g.key);
            if (!items.length) return null;
            const GIcon = g.icon;
            return (
              <section key={g.key}>
                <h3 className={`flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] mb-3 ${g.cls}`}>
                  {g.key === 'urgent' && <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-rose-500 animate-ping" /><span className="relative w-2 h-2 rounded-full bg-rose-600" /></span>}
                  <GIcon className="w-4 h-4" />{g.title} ({items.length})
                </h3>
                <ul className="space-y-3 stagger">
                  {items.map((r) => {
                    const tab = REMINDER_TAB[r.type];
                    const s = SECTIONS[tab];
                    const rPet = pets.find((p) => p.id === r.petId);
                    return (
                      <li key={r.id} className={`card border-l-4 ${g.card} p-4 flex items-start gap-3`}>
                        <IconTile icon={s.icon} tone={s.tone} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-extrabold text-paw-dark dark:text-white">{r.title}</h4>
                            {scope === 'all' && rPet && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-paw-mist dark:bg-paw-darksurface text-[10px] font-bold text-paw-dark dark:text-white">
                                <PetAvatar pet={rPet} className="w-4 h-4" />{rPet.name}
                              </span>
                            )}
                            {whenLabel(r) && <span className="ml-auto text-[11px] font-extrabold text-paw-secondary dark:text-paw-warm-sage">{whenLabel(r)}</span>}
                          </div>
                          <p className="text-xs text-paw-secondary dark:text-paw-warm-sage mt-0.5">{r.message}</p>
                          <button onClick={() => goTo(tab, r.petId)} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-paw-forest dark:text-paw-sage hover:underline">
                            {ACTION_LABEL[r.type]} <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="card p-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              {GROUPS.map((g) => (
                <div key={g.key} className="p-2 rounded-2xl bg-paw-mist dark:bg-paw-darksurface">
                  <div className={`text-2xl font-extrabold ${g.cls}`}>{shown.filter((r) => r.urgency === g.key).length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-paw-secondary dark:text-paw-warm-sage">{g.key === 'info' ? 'Tips' : g.key}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2.5"><IconTile icon={Mail} tone="teal" size="sm" /><h3 className="text-sm font-extrabold text-paw-dark dark:text-white">Daily email digest</h3></div>
            {prefs.emailReminders ? (
              <>
                <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">On — a summary goes to <strong className="text-paw-dark dark:text-white">{user?.email}</strong> each morning when something is due.</p>
                <button onClick={sendTest} disabled={sending} className="btn-secondary w-full">
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Mail className="w-4 h-4" /> Send me a test email</>}
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">Get a morning email whenever a vaccine, visit or dose is due.</p>
                <button onClick={enableEmail} disabled={enabling} className="btn-primary w-full">
                  {enabling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Turn on email reminders
                </button>
              </>
            )}
            {result && (
              <div className={`p-3 rounded-2xl text-xs animate-fadeIn ${result.delivered ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300'}`}>
                <p className="font-semibold">{result.msg}</p>
                {result.previewUrl && (
                  <a href={result.previewUrl} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 font-bold hover:underline">
                    View the email <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2.5"><IconTile icon={BellRing} tone="orange" size="sm" /><h3 className="text-sm font-extrabold text-paw-dark dark:text-white">Browser alerts</h3></div>
            <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">A pop-up on this device when something becomes urgent, and before timed visits.</p>
            <NotificationToggle />
          </div>

          <Link to="/settings" className="btn-ghost w-full"><SettingsIcon className="w-4 h-4" /> Reminder settings</Link>
        </aside>
      </div>
    </div>
  );
};
