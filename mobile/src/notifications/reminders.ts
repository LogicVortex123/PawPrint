import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Appointment, Vaccination } from '../db/repository';
import { getNotificationPrefs } from '../settings/storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (granted && Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'PawPrint reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return granted;
}

async function scheduleAt(id: string, title: string, body: string, when: Date, tab: string) {
  if (when.getTime() <= Date.now() + 60_000) return;
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, data: { tab } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
  });
}

export async function scheduleVaccinationReminder(record: Vaccination, petName: string) {
  await Notifications.cancelScheduledNotificationAsync(`vax-${record.localId}`).catch(() => undefined);
  const prefs = await getNotificationPrefs();
  if (!prefs.vaccination || record.deleted) return;
  if (!(await ensurePermission())) return;
  const due = new Date(`${record.nextDueDate}T09:00:00`);
  due.setDate(due.getDate() - prefs.leadDays);
  await scheduleAt(
    `vax-${record.localId}`,
    `${petName}'s ${record.vaccineName} is coming up`,
    `Due ${record.nextDueDate}. This reminder is not veterinary advice.`,
    due,
    'Health',
  );
}

export async function scheduleAppointmentReminders(record: Appointment, petName: string) {
  await Notifications.cancelScheduledNotificationAsync(`appt-${record.localId}-before`).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(`appt-${record.localId}-day`).catch(() => undefined);
  const prefs = await getNotificationPrefs();
  if (!prefs.appointment || record.deleted || record.status !== 'scheduled') return;
  if (!(await ensurePermission())) return;
  const when = new Date(record.date);
  const dayBefore = new Date(when);
  dayBefore.setDate(dayBefore.getDate() - 1);
  dayBefore.setHours(9, 0, 0, 0);
  const morning = new Date(when);
  morning.setHours(8, 0, 0, 0);
  const clinic = record.clinicName;
  await scheduleAt(`appt-${record.localId}-before`, `${petName} visits ${clinic} tomorrow`, record.reason || 'Vet appointment', dayBefore, 'Appointments');
  await scheduleAt(`appt-${record.localId}-day`, `${petName} has a vet visit today`, clinic, morning, 'Appointments');
}

export async function notifySyncFinished(failed: number) {
  const prefs = await getNotificationPrefs();
  if (!prefs.sync) return;
  if (!(await ensurePermission())) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: failed > 0 ? 'PawPrint could not finish syncing' : 'PawPrint synced',
      body: failed > 0
        ? `${failed} change${failed === 1 ? '' : 's'} still need a connection.`
        : 'Your records are saved to your account.',
    },
    trigger: null,
  });
}
