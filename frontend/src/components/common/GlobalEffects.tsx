import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { notifyDueReminders } from '../../lib/reminderNotifications';
import { GlobalSearch } from './GlobalSearch';

// App-wide behaviour that must run on every page once signed in, whichever
// layout (marketing navbar or app sidebar) is showing: record search on
// Ctrl/⌘+K, keeping reminders fresh, and browser alerts for due reminders.
export const GlobalEffects: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, reminders, fetchReminders, searchOpen, setSearchOpen } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAuthenticated, setSearchOpen]);

  // Due dates move as days pass, so refresh periodically and when the tab comes back
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchReminders();
    const timer = setInterval(fetchReminders, 30 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') fetchReminders(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [isAuthenticated, fetchReminders]);

  // Browser alerts for urgent reminders (only if the user turned alerts on)
  useEffect(() => {
    if (!isAuthenticated) return;
    return notifyDueReminders(reminders, () => navigate('/features?tab=reminders'));
  }, [isAuthenticated, reminders, navigate]);

  if (!isAuthenticated) return null;
  return <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />;
};
