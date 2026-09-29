// Browser notifications for Smart Reminders. Only urgent items (overdue, or due
// within a few days) trigger one, and each reminder notifies at most once per
// day, so reopening the app doesn't repeat the same alert.

import { Reminder } from '../types';
import { StorageKeys, readJson, writeJson } from './storage';

type NotifiedLog = { day: string; ids: string[] };

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const notificationPermission = (): NotificationPermission | 'unsupported' =>
  notificationsSupported() ? Notification.permission : 'unsupported';

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.requestPermission();
}

const today = () => new Date().toISOString().slice(0, 10);

export function notifyDueReminders(reminders: Reminder[], onOpen: () => void): void {
  if (notificationPermission() !== 'granted') return;

  const log = readJson<NotifiedLog>(StorageKeys.notifiedReminders, { day: '', ids: [] });
  const alreadySent = log.day === today() ? new Set(log.ids) : new Set<string>();
  const fresh = reminders.filter((r) => r.urgency === 'urgent' && !alreadySent.has(r.id));
  if (fresh.length === 0) return;

  const title = fresh.length === 1 ? `${fresh[0].petName}: ${fresh[0].title}` : `${fresh.length} pet care reminders need attention`;
  const body = fresh.length === 1
    ? fresh[0].message
    : fresh.slice(0, 3).map((r) => `${r.petName}: ${r.title}`).join('\n') + (fresh.length > 3 ? `\n+${fresh.length - 3} more` : '');

  try {
    const notification = new Notification(title, { body, icon: '/logo.jpeg', tag: 'pawprint-reminders' });
    notification.onclick = () => { window.focus(); onOpen(); notification.close(); };
  } catch {
    // Some browsers only allow notifications from a service worker — the bell still shows them
    return;
  }

  writeJson(StorageKeys.notifiedReminders, { day: today(), ids: [...alreadySent, ...fresh.map((r) => r.id)] });
}
