// Builds a one-event .ics calendar invite (same format as the web's
// "Add to Calendar" button) so appointment emails can carry it as an attachment.

const toIcsDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// Commas, semicolons, backslashes and newlines must be escaped in ICS text fields
const escapeIcs = (text) =>
  String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

function buildAppointmentIcs({ appointment, petName, durationMinutes = 45 }) {
  const start = new Date(appointment.date);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const reason = appointment.reason || 'Vet appointment';
  const location = [appointment.clinic?.name, appointment.clinic?.address].filter(Boolean).join(', ');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PawPrint//Appointments//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${appointment._id}@pawprint`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(`${petName}: ${reason}`)}`,
    location && `LOCATION:${escapeIcs(location)}`,
    appointment.notes && `DESCRIPTION:${escapeIcs(appointment.notes)}`,
    // A reminder the calendar app itself shows a day before
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(`${petName}'s vet appointment tomorrow`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n');
}

module.exports = { buildAppointmentIcs };
