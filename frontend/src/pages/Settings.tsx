import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Palette, Bell, AlertTriangle, Sun, Moon, Monitor } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { inputCls, labelCls, primaryBtnCls } from '../components/common/Modal';
import { DEFAULT_PREFERENCES, ThemePreference, UserPreferences } from '../types';
import { NotificationToggle } from '../components/common/NotificationToggle';

const card = 'bg-[#FAFAF6] dark:bg-paw-darksurface rounded-3xl p-6 sm:p-8 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft';
const heading = 'flex items-center gap-2 text-lg font-extrabold text-paw-dark dark:text-white mb-1';
const sub = 'text-sm text-paw-secondary dark:text-paw-warm-sage/80 mb-5';
const errText = (err: unknown, fallback: string) => `❌ ${err instanceof Error ? err.message : fallback}`;

export const Settings: React.FC = () => {
  const { user, updateProfile, changePassword, deleteAccount, themePreference, setThemePreference, showToast } = useAppStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const prefs: UserPreferences = user?.preferences ?? DEFAULT_PREFERENCES;
  const [savingPrefs, setSavingPrefs] = useState(false);

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

  const toggleReminder = (key: keyof UserPreferences['reminders']) =>
    savePrefs({ ...prefs, reminders: { ...prefs.reminders, [key]: !prefs.reminders[key] } });

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
  ];

  return (
    <div className="py-12 lg:py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-paw-dark dark:text-white">Account Settings</h1>
          <p className="text-paw-secondary dark:text-paw-warm-sage/80 mt-1">Manage your profile, sign-in, appearance and reminders.</p>
        </div>

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
                <input type="checkbox" checked={prefs.reminders[opt.key]} disabled={savingPrefs} onChange={() => toggleReminder(opt.key)}
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
          </div>
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
