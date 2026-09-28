import { Appointment } from '../types';

// Builds a one-event .ics file that Google Calendar, Apple Calendar and Outlook
// can all import, and triggers a download for it.

const toIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// Commas, semicolons, backslashes and newlines must be escaped in ICS text fields
const escapeIcs = (text: string) =>
  text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

export function downloadAppointmentIcs(apt: Appointment, petName: string, durationMinutes = 45) {
  const start = new Date(apt.dateISO);
  if (Number.isNaN(start.getTime())) return;
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PawPrint//Appointments//EN',
    'BEGIN:VEVENT',
    `UID:${apt.id}@pawprint`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(`${petName}: ${apt.reason}`)}`,
    `LOCATION:${escapeIcs([apt.clinicName, apt.clinicAddress].filter(Boolean).join(', '))}`,
    ...(apt.notes ? [`DESCRIPTION:${escapeIcs(apt.notes)}`] : []),
    // Reminder one day before
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(`${petName}'s vet appointment tomorrow`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${petName}-appointment.ics`.replace(/\s+/g, '-');
  link.click();
  URL.revokeObjectURL(url);
}
