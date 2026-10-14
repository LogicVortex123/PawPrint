import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Palette, Bell, AlertTriangle, Sun, Moon, Monitor, Mail, Send, ExternalLink, Info, Download, Loader2 } from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';
import { SectionHeader } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { inputCls, labelCls, primaryBtnCls } from '../components/common/Modal';
import { apiRequest } from '../lib/api';
import { CURRENCY_OPTIONS } from '../lib/money';
import { DEFAULT_PREFERENCES, ThemePreference, UserPreferences } from '../types';
import { NotificationToggle } from '../components/common/NotificationToggle';

const card = 'card p-6 sm:p-8';
const heading = 'flex items-center gap-2 text-lg font-extrabold text-paw-dark dark:text-white mb-1';
const sub = 'text-sm text-paw-secondary dark:text-paw-warm-sage/80 mb-5';
const errText = (err: unknown, fallback: string) => `❌ ${err instanceof Error ? err.message : fallback}`;

export const Settings: React.FC = () => {
  const { user, token, updateProfile, changePassword, deleteAccount, themePreference, setThemePreference, showToast, sendTestReminderEmail, downloadMyData } = useAppStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const prefs: UserPreferences = user?.preferences ?? DEFAULT_PREFERENCES;
  const emailOn = prefs.emailReminders ?? false;

  const [savingPrefs, setSavingPrefs] = useState(false);

  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ text: string; tone: 'ok' | 'warn' | 'error'; previewUrl?: string | null } | null>(null);
  // Whether the server can actually deliver email (null = not checked yet)
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (!emailOn || smtpConfigured !== null) return;
    apiRequest<{ smtpConfigured: boolean }>('/reminders/email-status', { token })
      .then((r) => setSmtpConfigured(r.smtpConfigured))
      .catch(() => {});
  }, [emailOn, smtpConfigured, token]);

  const [downloading, setDownloading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;
  const hasPassword = user.hasPassword ?? user.authProvider === 'local';

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast('⚠️ Name cannot be empty.'); return; }
    setSavingName(true);
    try {
      await updateProfile({ name: name.trim() });
      showToast('✅ Profile updated.');
    } catch (err) {
      showToast(errText(err, 'Could not update your profile.'));
    } finally { setSavingName(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { showToast('⚠️ New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { showToast('⚠️ The two new passwords don\'t match.'); return; }
    setSavingPassword(true);
    try {
      await changePassword(hasPassword ? currentPassword : undefined, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showToast(hasPassword ? '🔒 Password changed.' : '🔒 Password set — you can now also log in with email and password.');
    } catch (err) {
      showToast(errText(err, 'Could not change your password.'));
    } finally { setSavingPassword(false); }
  };

  // Preferences save immediately on change
  const savePrefs = async (next: UserPreferences) => {
    setSavingPrefs(true);
    try {
      await updateProfile({ preferences: next });
    } catch (err) {
      showToast(errText(err, 'Could not save reminder settings.'));
    } finally { setSavingPrefs(false); }
  };

  // Older saved settings may not have every type yet — missing means on
  const reminderOn = (key: keyof UserPreferences['reminders']) => prefs.reminders[key] !== false;
  const toggleReminder = (key: keyof UserPreferences['reminders']) =>
    savePrefs({ ...prefs, reminders: { ...prefs.reminders, [key]: !reminderOn(key) } });

  const toggleEmailReminders = () =>
    savePrefs({ ...prefs, emailReminders: !prefs.emailReminders });

  const handleSendTest = async () => {
    setSendingTest(true);
    setTestResult(null);
    try {
      const result = await sendTestReminderEmail();
      setTestResult({ text: result.message, tone: result.delivered ? 'ok' : 'warn', previewUrl: result.previewUrl });
    } catch (err) {
      setTestResult({ text: errText(err, 'Could not send the test email.'), tone: 'error' });
    } finally { setSendingTest(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadMyData();
      showToast('📦 Your data has been downloaded.');
    } catch (err) {
      showToast(errText(err, 'Could not download your data.'));
    } finally { setDownloading(false); }
  };

  const handleDelete = async () => {
    if (deleteConfirm.trim().toLowerCase() !== user.email) { showToast('⚠️ Type your account email exactly to confirm.'); return; }
    if (!window.confirm('This permanently deletes your account, every pet, and all records and files. Continue?')) return;
    setDeleting(true);
    try {
      await deleteAccount(deleteConfirm.trim());
      showToast('Your account and all data have been deleted.');
      navigate('/');
    } catch (err) {
      showToast(errText(err, 'Could not delete your account.'));
      setDeleting(false);
    }
  };

  const themeOptions: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'Match my device', icon: <Monitor className="w-4 h-4" /> },
  ];

  const reminderOptions: { key: keyof UserPreferences['reminders']; label: string; hint: string }[] = [
    { key: 'vaccination', label: 'Vaccinations', hint: 'Due soon and overdue vaccines' },
    { key: 'appointment', label: 'Appointments', hint: 'Upcoming vet visits' },
    { key: 'weight', label: 'Weight check-ins', hint: 'Nudges when no weight has been logged for a month' },
    { key: 'medication', label: 'Medications', hint: "Doses still to give today, and courses that are about to end" },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="max-w-3xl space-y-6">
        <SectionHeader icon={SettingsIcon} tone="slate" eyebrow="Account" title="Settings"
          description="Your profile, sign-in, appearance, reminders and data." />

        {/* Profile */}
        <section className={card}>
          <h2 className={heading}><User className="w-5 h-5" /> Profile</h2>
          <p className={sub}>Signed in with {user.authProvider === 'google' ? 'Google' : 'email and password'}.</p>
          <form onSubmit={handleSaveName} className="space-y-4">
            <div><label className={labelCls}>Name</label><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Email</label><input value={user.email} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} /></div>
            <button type="submit" disabled={savingName || name.trim() === user.name} className={primaryBtnCls}>{savingName ? 'Saving…' : 'Save profile'}</button>
          </form>
        </section>

        {/* Password */}
        <section className={card}>
          <h2 className={heading}><Lock className="w-5 h-5" /> {hasPassword ? 'Change password' : 'Set a password'}</h2>
          <p className={sub}>{hasPassword ? 'Use at least 8 characters.' : 'Your account uses Google Sign-In. Set a password to also log in with your email.'}</p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {hasPassword && (
              <div><label className={labelCls}>Current password</label><input type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} /></div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>New password</label><input type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Confirm new password</label><input type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} /></div>
            </div>
            <button type="submit" disabled={savingPassword} className={primaryBtnCls}>{savingPassword ? 'Saving…' : hasPassword ? 'Change password' : 'Set password'}</button>
          </form>
        </section>

        {/* Appearance */}
        <section className={card}>
          <h2 className={heading}><Palette className="w-5 h-5" /> Appearance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {themeOptions.map((opt) => (
              <button key={opt.value} onClick={() => setThemePreference(opt.value)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold border transition-colors ${themePreference === opt.value ? 'bg-paw-forest text-white border-paw-forest' : 'bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white border-paw-soft-sage dark:border-paw-darkborder hover:bg-paw-light-sage/40'}`}>
                {opt.icon}{opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Money */}
        <section className={card}>
          <h2 className={heading}><span aria-hidden>💱</span> Currency</h2>
          <p className={sub}>Used for expenses and spending totals.</p>
          <select value={prefs.currency ?? 'INR'} disabled={savingPrefs} aria-label="Currency"
            onChange={(e) => savePrefs({ ...prefs, currency: e.target.value as UserPreferences['currency'] })}
            className={inputCls}>
            {CURRENCY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </section>

        {/* Reminders */}
        <section className={card}>
          <h2 className={heading}><Bell className="w-5 h-5" /> Reminders</h2>
          <p className={sub}>Choose what shows up in Smart Reminders. {savingPrefs && <span className="font-semibold">Saving…</span>}</p>
          <div className="space-y-3">
            {reminderOptions.map((opt) => (
              <label key={opt.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-paw-cream dark:bg-paw-darkcard border border-paw-soft-sage/60 dark:border-paw-darkborder cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-paw-dark dark:text-white">{opt.label}</div>
                  <div className="text-xs text-paw-secondary dark:text-paw-warm-sage">{opt.hint}</div>
                </div>
                <input type="checkbox" checked={reminderOn(opt.key)} disabled={savingPrefs} onChange={() => toggleReminder(opt.key)}
                  className="w-5 h-5 accent-paw-forest" />
              </label>
            ))}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-paw-cream dark:bg-paw-darkcard border border-paw-soft-sage/60 dark:border-paw-darkborder">
              <div>
                <div className="text-sm font-bold text-paw-dark dark:text-white">Remind me ahead by</div>
                <div className="text-xs text-paw-secondary dark:text-paw-warm-sage">How far in advance due dates and visits appear</div>
              </div>
              <select value={prefs.reminderLeadDays} disabled={savingPrefs}
                onChange={(e) => savePrefs({ ...prefs, reminderLeadDays: Number(e.target.value) })}
                className="px-3 py-2 rounded-xl border border-paw-soft-sage dark:border-paw-darkborder bg-white dark:bg-paw-darksurface text-paw-dark dark:text-white text-sm">
                {[3, 7, 14, 30, 60].map((d) => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-paw-cream dark:bg-paw-darkcard border border-paw-soft-sage/60 dark:border-paw-darkborder">
              <div>
                <div className="text-sm font-bold text-paw-dark dark:text-white">Browser alerts</div>
                <div className="text-xs text-paw-secondary dark:text-paw-warm-sage">Get a notification when something is overdue or due in the next few days</div>
              </div>
              <NotificationToggle />
            </div>

            {/* ── Email Reminders ── */}
            <div className="rounded-2xl bg-paw-cream dark:bg-paw-darkcard border border-paw-soft-sage/60 dark:border-paw-darkborder overflow-hidden">
              <label className="flex items-center justify-between gap-4 p-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-paw-forest/10 dark:bg-paw-forest/20">
                    <Mail className="w-4 h-4 text-paw-forest dark:text-paw-warm-sage" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-paw-dark dark:text-white">Email reminders</div>
                    <div className="text-xs text-paw-secondary dark:text-paw-warm-sage">
                      A daily digest at 8:00 AM, plus a confirmation with a calendar invite whenever you book or move a vet visit — sent to <span className="font-semibold">{user.email}</span>
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailOn}
                  disabled={savingPrefs}
                  onChange={toggleEmailReminders}
                  className="w-5 h-5 accent-paw-forest"
                />
              </label>

              {/* Test-send button — only visible when email reminders are on */}
              {emailOn && (
                <div className="px-4 pb-4 border-t border-paw-soft-sage/40 dark:border-paw-darkborder pt-3 flex flex-col gap-3">
                  {smtpConfigured === false && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                      <Info className="w-4 h-4 flex-shrink-0 mt-px" />
                      <span>Email delivery isn't switched on yet, so reminder emails won't reach your inbox for now. You can still send a test to preview exactly what you'd receive.</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      id="send-test-email-btn"
                      onClick={handleSendTest}
                      disabled={sendingTest}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border border-paw-forest text-paw-forest dark:text-paw-warm-sage dark:border-paw-warm-sage hover:bg-paw-forest hover:text-white dark:hover:bg-paw-forest transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sendingTest ? 'Sending…' : 'Send test email now'}
                    </button>
                  </div>
                  {testResult && (
                    <div className={`text-xs font-medium space-y-1.5 ${
                      testResult.tone === 'error' ? 'text-rose-600 dark:text-rose-400' : testResult.tone === 'warn' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      <p>{testResult.text}</p>
                      {testResult.previewUrl && (
                        <a href={testResult.previewUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-paw-forest dark:text-paw-sage hover:underline">
                          Open email preview <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-paw-secondary dark:text-paw-warm-sage/70">
                    Sends today's digest right now so you can check it arrives. After that it's automatic every morning at 8:00 AM.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Your data */}
        <section className={card}>
          <h2 className={heading}><Download className="w-5 h-5" /> Your data</h2>
          <p className={sub}>Download everything PawPrint stores for your account — pets, health records, medications, expenses and settings — as one file you can keep or move elsewhere.</p>
          <button onClick={handleDownload} disabled={downloading} className={`${primaryBtnCls} inline-flex items-center gap-2`}>
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? 'Preparing…' : 'Download my data'}
          </button>
        </section>

        {/* Danger zone */}
        <section className="rounded-3xl p-6 sm:p-8 border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-rose-800 dark:text-rose-300 mb-1"><AlertTriangle className="w-5 h-5" /> Delete account</h2>
          <p className="text-sm text-rose-800/80 dark:text-rose-300/80 mb-4">
            Permanently deletes your account, every pet, and all vaccinations, weights, appointments and documents. This cannot be undone.
          </p>
          <label className="block text-xs font-bold text-rose-800 dark:text-rose-300 mb-1.5">Type <span className="font-mono">{user.email}</span> to confirm</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} className={`${inputCls} border-rose-200 dark:border-rose-900`} />
            <button onClick={handleDelete} disabled={deleting || deleteConfirm.trim().toLowerCase() !== user.email}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 whitespace-nowrap">
              {deleting ? 'Deleting…' : 'Delete my account'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
