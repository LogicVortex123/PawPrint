/**
 * Email reminders
 *
 * 1. Daily digest — runs every day at 8:00 AM (server time). For every user who
 *    turned on email reminders it builds the same Smart Reminders list the
 *    dashboard bell shows and, if anything needs doing, emails it.
 * 2. Appointment emails — sent straight away when an appointment is booked or
 *    moved, with a calendar invite attached.
 */

const cron = require('node-cron');
const User = require('../models/User.model');
const Pet = require('../models/Pet.model');
const { buildReminders } = require('./reminders.service');
const { loadReminderInputs } = require('./reminderData.service');
const { localDateKey } = require('./medicationSchedule.service');
const { sendMail, isConfigured } = require('./email.service');
const { buildReminderEmail, buildAppointmentEmail } = require('./emailTemplates.service');
const { buildAppointmentIcs } = require('./ics.service');
const { email: emailCfg } = require('../config/env');

/**
 * Send digest emails to opted-in users.
 * @param {string} [specificUserId] — only this user (the "send test email" button)
 * @param {{ includeEmpty?: boolean }} [options] — includeEmpty: send an all-clear
 *   email even when nothing is due (so a test always produces an email)
 */
async function runEmailReminders(specificUserId = null, { includeEmpty = false } = {}) {
  const query = specificUserId
    ? { _id: specificUserId, 'preferences.emailReminders': true }
    : { 'preferences.emailReminders': true };

  const users = await User.find(query).select('name email preferences').lean();
  const todayKey = localDateKey();

  let sent = 0;
  let skipped = 0;
  let simulated = false;
  let previewUrl;
  let reminderCount = 0;

  for (const user of users) {
    try {
      const pets = await Pet.find({ owner: user._id }).lean();
      if (pets.length === 0) { skipped++; continue; }

      const inputs = await loadReminderInputs(user._id, pets, todayKey);
      const { leadDays, reminders } = buildReminders({ pets, ...inputs, todayKey, preferences: user.preferences });

      if (reminders.length === 0 && !includeEmpty) { skipped++; continue; }

      const { subject, html, text } = buildReminderEmail({ userName: user.name, reminders, leadDays });
      const result = await sendMail({ to: user.email, subject, html, text });
      sent++;
      reminderCount = reminders.length;
      if (result.simulated) {
        simulated = true;
        previewUrl = result.previewUrl;
      }
      console.log(`[email-reminders] ${result.simulated ? 'Built (not delivered)' : 'Sent'} for ${user.email} — ${reminders.length} reminder(s)`);
    } catch (err) {
      console.error(`[email-reminders] Failed for user ${user.email}:`, err.message);
      skipped++;
      if (specificUserId) throw err;
    }
  }

  if (!specificUserId) console.log(`[email-reminders] Done — sent: ${sent}, skipped/failed: ${skipped}`);
  return { sent, skipped, simulated, previewUrl, reminderCount };
}

/**
 * Email the owner about a booked or rescheduled appointment. Never throws —
 * a failed email must not fail the booking itself.
 * @param {'booked' | 'rescheduled'} kind
 */
async function sendAppointmentEmail(ownerId, appointment, kind) {
  try {
    const user = await User.findById(ownerId).select('name email preferences').lean();
    if (!user?.preferences?.emailReminders || appointment.status !== 'scheduled') return;
    // Past visits (e.g. logging one after the fact) don't need a confirmation
    if (new Date(appointment.date).getTime() < Date.now()) return;

    const pet = await Pet.findById(appointment.pet).select('name').lean();
    const petName = pet?.name || 'Your pet';
    const { subject, html, text } = buildAppointmentEmail({ userName: user.name, petName, appointment, kind });

    await sendMail({
      to: user.email,
      subject,
      html,
      text,
      attachments: [{
        filename: `${petName.replace(/[^\w-]+/g, '_')}-appointment.ics`,
        content: buildAppointmentIcs({ appointment, petName }),
        contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
      }],
    });
  } catch (err) {
    console.error(`[email] Appointment ${kind} email failed:`, err.message);
  }
}

/**
 * Start the daily cron job. Call this once after the DB is connected.
 */
function startEmailReminderCron() {
  if (!emailCfg.enabled) {
    console.log('[email-reminders] Cron disabled via EMAIL_REMINDERS_ENABLED=false');
    return;
  }
  if (!isConfigured()) {
    console.warn('[email-reminders] No Gmail/SMTP login in backend/.env (EMAIL_USER / EMAIL_PASS) — emails will NOT reach real inboxes. In development each email gets a preview link in this log instead.');
  }

  // Every day at 08:00 AM server time
  cron.schedule('0 8 * * *', async () => {
    console.log('[email-reminders] Daily cron triggered');
    try {
      await runEmailReminders();
    } catch (err) {
      console.error('[email-reminders] Daily run failed:', err.message);
    }
  });

  console.log('[email-reminders] Daily reminder cron scheduled for 08:00 AM');
}

module.exports = { startEmailReminderCron, runEmailReminders, sendAppointmentEmail };
