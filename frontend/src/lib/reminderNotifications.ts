// Browser notifications for Smart Reminders.
// - Appointments alert at set times before the visit (a day before, and an hour
//   before), never the moment they're booked. An alert time that had already
//   passed when the visit was booked is skipped.
// - Other urgent reminders (vaccines due soon or overdue) alert when the app is
//   opened in a new browser session and again every few hours while still urgent.

import { Reminder } from '../types';
import { StorageKeys, readJson, writeJson } from './storage';

// alert key -> when we sent it (ms since epoch). Keys are the reminder id, or
// `<id>@<offset>` for an appointment's timed alerts.
type NotifiedLog = Record<string, number>;

const HOUR_MS = 60 * 60 * 1000;
const REPEAT_AFTER_MS = 4 * HOUR_MS;
// How long before an appointment each alert goes out, earliest first
const APPOINTMENT_ALERT_OFFSETS_MS = [24 * HOUR_MS, HOUR_MS];
const MAX_TIMER_MS = 2 ** 31 - 1; // setTimeout's limit (~24.8 days)
const SESSION_KEY = 'pawprint-reminder-session';

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const notificationPermission = (): NotificationPermission | 'unsupported' =>
  notificationsSupported() ? Notification.permission : 'unsupported';

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.requestPermission();
}

// True the first time it's called in a browser session (a new tab or window)
function isNewSession(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

function readLog(): NotifiedLog {
  const stored = readJson<unknown>(StorageKeys.notifiedReminders, {});
  // Older builds stored { day, ids } — anything that isn't a plain key->time map starts fresh
  return stored && typeof stored === 'object' && !('ids' in stored) ? (stored as NotifiedLog) : {};
}

function show(title: string, body: string, tag: string, onOpen: () => void): boolean {
  try {
    // renotify makes the browser pop up again even if an earlier alert used the same tag
    const notification = new Notification(title, { body, icon: '/logo.jpeg', tag, renotify: true } as NotificationOptions);
    notification.onclick = () => { window.focus(); onOpen(); notification.close(); };
    return true;
  } catch {
    // Some browsers only allow notifications from a service worker — the bell still shows them
    return false;
  }
}

function timeUntil(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60000));
  if (minutes < 60) return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${hours} hour${hours === 1 ? '' : 's'}`;
  return 'tomorrow';
}

// Sends any appointment alert whose time has come; returns when the next one is due
function checkAppointments(appointments: Reminder[], log: NotifiedLog, onOpen: () => void): number | null {
  const now = Date.now();
  let nextAt: number | null = null;

  for (const r of appointments) {
    if (!r.dueDate) continue;
    const startsAt = new Date(r.dueDate).getTime();
    if (Number.isNaN(startsAt) || startsAt <= now) continue;
    const bookedAt = r.bookedAt ? new Date(r.bookedAt).getTime() : 0;

    // Alert times that fall after the booking was made
    const alertTimes = APPOINTMENT_ALERT_OFFSETS_MS
      .map((offset) => ({ key: `${r.id}@${offset}`, at: startsAt - offset }))
      .filter((a) => a.at > bookedAt);

    const due = alertTimes.filter((a) => a.at <= now && !log[a.key]);
    if (due.length > 0) {
      const time = new Date(startsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const title = `${r.petName}: ${r.title.replace(/ (today|tomorrow|in \d+ days)$/, '')} ${timeUntil(startsAt - now)}`;
      if (show(title, `${r.message.replace(/\.$/, '')} at ${time}.`, r.id, onOpen)) {
        // Several missed alert times collapse into one — mark them all as sent
        due.forEach((a) => { log[a.key] = now; });
      }
    }

    const upcoming = alertTimes.find((a) => a.at > now);
    if (upcoming && (nextAt === null || upcoming.at < nextAt)) nextAt = upcoming.at;
  }
  return nextAt;
}

function checkOtherUrgent(reminders: Reminder[], log: NotifiedLog, onOpen: () => void): void {
  const now = Date.now();
  const newSession = isNewSession();
  const fresh = reminders.filter((r) => newSession || !log[r.id] || now - log[r.id] >= REPEAT_AFTER_MS);
  if (fresh.length === 0) return;

  const title = fresh.length === 1 ? `${fresh[0].petName}: ${fresh[0].title}` : `${fresh.length} pet care reminders need attention`;
  const body = fresh.length === 1
    ? fresh[0].message
    : fresh.slice(0, 3).map((r) => `${r.petName}: ${r.title}`).join('\n') + (fresh.length > 3 ? `\n+${fresh.length - 3} more` : '');

  if (show(title, body, 'pawprint-reminders', onOpen)) fresh.forEach((r) => { log[r.id] = now; });
}

// Checks reminders now and keeps a timer for the next appointment alert.
// Returns a cleanup function that cancels that timer.
export function notifyDueReminders(reminders: Reminder[], onOpen: () => void): () => void {
  if (notificationPermission() !== 'granted') return () => {};

  const appointments = reminders.filter((r) => r.type === 'appointment');
  const otherUrgent = reminders.filter((r) => r.type !== 'appointment' && r.urgency === 'urgent');
  let timer: ReturnType<typeof setTimeout> | undefined;

  const run = () => {
    const log = readLog();
    const nextAt = checkAppointments(appointments, log, onOpen);

    // Keep only entries for reminders that still exist so the log doesn't grow forever
    const liveIds = new Set(reminders.map((r) => r.id));
    const pruned: NotifiedLog = {};
    Object.entries(log).forEach(([key, at]) => { if (liveIds.has(key.split('@')[0])) pruned[key] = at; });
    writeJson(StorageKeys.notifiedReminders, pruned);

    if (nextAt !== null) timer = setTimeout(run, Math.min(Math.max(nextAt - Date.now(), 0) + 500, MAX_TIMER_MS));
  };

  if (otherUrgent.length > 0) {
    const log = readLog();
    checkOtherUrgent(otherUrgent, log, onOpen);
    writeJson(StorageKeys.notifiedReminders, log);
  }
  run();

  return () => { if (timer) clearTimeout(timer); };
}
