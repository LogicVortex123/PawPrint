const { buildReminderEmail, buildAppointmentEmail, buildPasswordResetEmail } = require('../../src/services/emailTemplates.service');
const { buildAppointmentIcs } = require('../../src/services/ics.service');

describe('email templates', () => {
  test('user-typed text is escaped, never injected as HTML', () => {
    const { html } = buildReminderEmail({
      userName: '<b>Asha</b>', leadDays: 14,
      reminders: [{ type: 'vaccination', urgency: 'urgent', petName: '<script>x</script>', title: 'Rabies & co', message: 'ok' }],
    });
    expect(html).not.toContain('<script>x</script>');
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;');
    expect(html).toContain('Rabies &amp; co');
  });

  test('an empty digest says all caught up', () => {
    const { subject, text } = buildReminderEmail({ userName: 'Asha', reminders: [], leadDays: 14 });
    expect(subject).toMatch(/All caught up/);
    expect(text).toMatch(/all caught up/);
  });

  test('appointment email and calendar invite carry the visit details', () => {
    const appointment = { _id: 'a1', pet: 'p1', date: '2026-03-02T10:30:00Z', reason: 'Dental, cleaning', clinic: { name: 'Green Valley' }, status: 'scheduled' };
    const { subject, text } = buildAppointmentEmail({ userName: 'Asha', petName: 'Bruno', appointment, kind: 'booked' });
    expect(subject).toMatch(/^🐾 Bruno's dental, cleaning is booked/);
    expect(text).toContain('Where: Green Valley');

    const ics = buildAppointmentIcs({ appointment, petName: 'Bruno' });
    expect(ics).toContain('DTSTART:20260302T103000Z');
    expect(ics).toContain(String.raw`SUMMARY:Bruno: Dental\, cleaning`);
    expect(ics).toContain('TRIGGER:-P1D');
  });

  test('reset email contains the link and expiry', () => {
    const { html, text } = buildPasswordResetEmail({ userName: 'Asha', resetUrl: 'http://localhost:5173/reset-password?token=abc', expiresInMinutes: 30 });
    expect(text).toContain('http://localhost:5173/reset-password?token=abc');
    expect(html).toContain('30 minutes');
  });
});
