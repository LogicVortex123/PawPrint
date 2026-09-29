import React, { useState } from 'react';
import { BellRing, BellOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { notificationPermission, requestNotificationPermission } from '../../lib/reminderNotifications';

// Lets the user turn on browser alerts for urgent reminders. Once allowed or
// blocked, only the browser's own site settings can change it, so we say so.
export const NotificationToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { showToast } = useAppStore();
  const [permission, setPermission] = useState(notificationPermission());

  if (permission === 'unsupported') return null;

  if (permission === 'granted') {
    return (
      <p className={`flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 ${compact ? 'justify-center' : ''}`}>
        <BellRing className="w-3.5 h-3.5" /> Browser alerts are on
      </p>
    );
  }

  if (permission === 'denied') {
    return (
      <p className={`flex items-center gap-2 text-xs text-paw-secondary dark:text-paw-warm-sage ${compact ? 'justify-center' : ''}`}>
        <BellOff className="w-3.5 h-3.5" /> Alerts are blocked. Allow notifications for this site in your browser settings.
      </p>
    );
  }

  const enable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      showToast("🔔 Alerts on. We'll notify you when something is due.");
      // Notify straight away about anything already urgent
      useAppStore.getState().fetchReminders();
    }
  };

  return (
    <button onClick={enable}
      className={`inline-flex items-center justify-center gap-2 rounded-full text-sm font-bold bg-paw-forest text-white hover:bg-paw-deep transition-colors ${compact ? 'w-full py-2' : 'px-5 py-2.5'}`}>
      <BellRing className="w-4 h-4" /> Turn on browser alerts
    </button>
  );
};
