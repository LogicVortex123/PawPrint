const User = require('../models/User.model');
const Pet = require('../models/Pet.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { buildReminders } = require('../services/reminders.service');
const { loadReminderInputs } = require('../services/reminderData.service');
const { isDateKey, localDateKey } = require('../services/medicationSchedule.service');
const { runEmailReminders } = require('../services/emailReminder.service');
const { isConfigured } = require('../services/email.service');

// GET /reminders?pet=<id>&date=YYYY-MM-DD — Smart Reminders for all of the user's
// pets (or one), filtered and timed by their Account Settings reminder preferences.
// `date` is the browser's calendar day, used for today's medication doses.
const list = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, 'User not found');

  const pets = req.query.pet
    ? [await findOwnedPetOrFail(req.query.pet, req.userId)]
    : await Pet.find({ owner: req.userId });
  const todayKey = isDateKey(req.query.date) ? req.query.date : localDateKey();

  const inputs = await loadReminderInputs(req.userId, pets, todayKey);
  const { leadDays, reminders } = buildReminders({ pets, ...inputs, todayKey, preferences: user.preferences });

  const counts = { urgent: 0, upcoming: 0, info: 0 };
  for (const r of reminders) counts[r.urgency] += 1;

  res.json({ leadDays, counts, reminders });
});

// POST /reminders/send-test
// Immediately sends today's reminder digest to the logged-in user, so they can
// check email works without waiting for the 8:00 AM run.
const sendTest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (!user.preferences?.emailReminders) {
    throw new ApiError(400, 'Email reminders are turned off. Turn them on first, then try again.');
  }

  let result;
  try {
    result = await runEmailReminders(String(req.userId), { includeEmpty: true });
  } catch (err) {
    console.error('[email-reminders] Test send failed:', err.message);
    throw new ApiError(502, `Couldn't send the email — the mail server said: ${err.message}`);
  }
  const { sent, simulated, previewUrl, reminderCount } = result;

  if (sent === 0) {
    return res.json({ delivered: false, message: 'Add a pet first — the digest is built from your pets\' records.' });
  }

  const what = reminderCount
    ? `${reminderCount} reminder${reminderCount === 1 ? '' : 's'}`
    : 'an all-clear (nothing is due right now)';

  if (simulated) {
    return res.json({
      delivered: false,
      previewUrl: previewUrl || null,
      message: previewUrl
        ? `Your digest (${what}) was created but not delivered, because email sending isn't set up on the server yet. Open the preview to see exactly what you'd receive.`
        : `Your digest (${what}) was created but not delivered, because email sending isn't set up on the server yet.`,
    });
  }

  res.json({ delivered: true, message: `Sent to ${user.email} with ${what}. Check your inbox (and spam).` });
});

// GET /reminders/email-status — whether the server can really deliver email
const emailStatus = asyncHandler(async (req, res) => {
  res.json({ smtpConfigured: isConfigured() });
});

module.exports = { list, sendTest, emailStatus };
