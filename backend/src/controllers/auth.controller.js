const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User.model');
const Pet = require('../models/Pet.model');
const Vaccination = require('../models/Vaccination.model');
const WeightRecord = require('../models/WeightRecord.model');
const Document = require('../models/Document.model');
const Appointment = require('../models/Appointment.model');
const Medication = require('../models/Medication.model');
const MedicationDose = require('../models/MedicationDose.model');
const ShareLink = require('../models/ShareLink.model');
const Expense = require('../models/Expense.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const { verifyGoogleToken } = require('../services/googleAuth.service');
const { removeUploadedFile } = require('../services/uploadFiles.service');
const { sendMail } = require('../services/email.service');
const { buildPasswordResetEmail } = require('../services/emailTemplates.service');
const { appUrl } = require('../config/env');
const { requireString, isEmail } = require('../utils/validate');

// bcrypt only uses the first 72 bytes of a password
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

function checkPassword(password, label = 'Password') {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN) {
    throw new ApiError(400, `${label} must be at least ${PASSWORD_MIN} characters`);
  }
  if (Buffer.byteLength(password) > PASSWORD_MAX) throw new ApiError(400, `${label} must be ${PASSWORD_MAX} characters or fewer`);
  return password;
}

const SALT_ROUNDS = 12;
const RESET_TOKEN_MINUTES = 30;
// One reset email per account per minute, so the endpoint can't be used to flood an inbox
const RESET_COOLDOWN_MS = 60 * 1000;

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Strip out sensitive/internal fields before sending user data to the client
function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    authProvider: user.authProvider,
    hasPassword: Boolean(user.passwordHash),
    preferences: user.preferences,
    favoriteClinicIds: (user.favoriteClinics || []).map(String),
  };
}

// POST /auth/register
const register = asyncHandler(async (req, res) => {
  const name = requireString(req.body.name, 'Name', { max: 80 });
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!isEmail(email)) throw new ApiError(400, 'Please enter a valid email address');
  const password = checkPassword(req.body.password);

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, authProvider: 'local' });

  const token = generateToken(user._id);
  res.status(201).json({ token, user: toPublicUser(user) });
});

// POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  // passwordHash is excluded by default in the schema — need to select it explicitly
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');

  if (!user || !user.passwordHash) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);
  res.json({ token, user: toPublicUser(user) });
});

// GET /auth/me — returns the profile of whoever is currently logged in
const me = asyncHandler(async (req, res) => {
  // passwordHash is only selected so toPublicUser can report hasPassword
  const user = await User.findById(req.userId).select('+passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  res.json(toPublicUser(user));
});

// POST /auth/google — accepts a Google ID token from either the mobile app or web
const google = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken || typeof idToken !== 'string') throw new ApiError(400, 'idToken is required');

  const { googleId, email, name } = await verifyGoogleToken(idToken);

  let user = await User.findOne({ googleId }).select('+passwordHash');

  if (!user) {
    // Maybe they registered with email/password first — link the Google ID
    user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (user) {
      user.googleId = googleId;
      await user.save();
    } else {
      user = await User.create({ name, email, googleId, authProvider: 'google' });
    }
  }

  const token = generateToken(user._id);
  res.json({ token, user: toPublicUser(user) });
});

// PUT /auth/me — Account Settings: display name and reminder preferences
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('+passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  const { name, preferences } = req.body;
  if (name !== undefined) user.name = requireString(name, 'Name', { max: 80 });
  if (preferences?.reminders) {
    for (const key of ['vaccination', 'appointment', 'weight', 'medication']) {
      if (typeof preferences.reminders[key] === 'boolean') user.preferences.reminders[key] = preferences.reminders[key];
    }
  }
  if (preferences?.reminderLeadDays !== undefined) user.preferences.reminderLeadDays = Number(preferences.reminderLeadDays);
  if (preferences?.emailReminders !== undefined) user.preferences.emailReminders = Boolean(preferences.emailReminders);
  if (preferences?.currency !== undefined) user.preferences.currency = preferences.currency;

  await user.save();
  res.json(toPublicUser(user));
});

// PUT /auth/password — change password; Google-only accounts can set a first one
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword } = req.body;
  const newPassword = checkPassword(req.body.newPassword, 'New password');

  const user = await User.findById(req.userId).select('+passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  if (user.passwordHash) {
    const matches = typeof currentPassword === 'string' && (await bcrypt.compare(currentPassword, user.passwordHash));
    if (!matches) throw new ApiError(400, 'Current password is incorrect');
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  // Any reset link still sitting in their inbox stops working
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json(toPublicUser(user));
});

// DELETE /auth/me — permanently deletes the account and every pet record/file.
// The client must send the account email back as a typed confirmation.
const deleteMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (String(req.body?.confirmEmail || '').toLowerCase() !== user.email) {
    throw new ApiError(400, 'Type your account email to confirm deletion');
  }

  const pets = await Pet.find({ owner: user._id });
  const petIds = pets.map((p) => p._id);
  const documents = await Document.find({ pet: { $in: petIds } });

  await Promise.all([
    Vaccination.deleteMany({ pet: { $in: petIds } }),
    WeightRecord.deleteMany({ pet: { $in: petIds } }),
    Document.deleteMany({ pet: { $in: petIds } }),
    Appointment.deleteMany({ owner: user._id }),
    Medication.deleteMany({ owner: user._id }),
    MedicationDose.deleteMany({ pet: { $in: petIds } }),
    ShareLink.deleteMany({ owner: user._id }),
    Expense.deleteMany({ owner: user._id }),
    Pet.deleteMany({ owner: user._id }),
  ]);
  await user.deleteOne();

  await Promise.all([...pets.map((p) => p.photoUrl), ...documents.map((d) => d.fileUrl)].map(removeUploadedFile));
  res.status(204).send();
});

// POST /auth/forgot-password { email } — emails a one-time reset link.
// Always answers the same way, so it can't be used to find out which emails have accounts.
const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) throw new ApiError(400, 'Email is required');

  const reply = { message: 'If an account exists for that email, a reset link is on its way. Check your inbox (and spam folder).' };
  const user = await User.findOne({ email }).select('+resetPasswordRequestedAt');
  if (!user) return res.json(reply);
  if (user.resetPasswordRequestedAt && Date.now() - user.resetPasswordRequestedAt.getTime() < RESET_COOLDOWN_MS) {
    return res.json(reply);
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordTokenHash = hashResetToken(token);
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000);
  user.resetPasswordRequestedAt = new Date();
  await user.save();

  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  const { subject, html, text } = buildPasswordResetEmail({ userName: user.name, resetUrl, expiresInMinutes: RESET_TOKEN_MINUTES });
  try {
    await sendMail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error('[auth] Could not send password reset email:', err.message);
    throw new ApiError(502, "We couldn't send the reset email right now. Please try again in a few minutes.");
  }
  res.json(reply);
});

// POST /auth/reset-password { token, password } — sets the new password and signs the user in
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.body || {};
  if (!token || typeof token !== 'string') throw new ApiError(400, 'Reset link is missing or invalid');
  const password = checkPassword(req.body.password);

  const user = await User.findOne({
    resetPasswordTokenHash: hashResetToken(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+passwordHash');
  if (!user) throw new ApiError(400, 'This reset link has expired or was already used. Request a new one.');

  user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  // The link works once
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ token: generateToken(user._id), user: toPublicUser(user) });
});

// GET /auth/export — everything stored for this account as one JSON file
// ("download my data"). Secrets — password hash, reset tokens, share tokens — are left out.
const exportData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('+passwordHash').lean();
  if (!user) throw new ApiError(404, 'User not found');

  const pets = await Pet.find({ owner: user._id }).lean();
  const petIds = pets.map((p) => p._id);
  const strip = ({ __v, clientLocalId, ...rest }) => rest;

  const [vaccinations, weights, appointments, documents, medications, doses, expenses, shares] = await Promise.all([
    Vaccination.find({ pet: { $in: petIds } }).lean(),
    WeightRecord.find({ pet: { $in: petIds } }).sort({ recordedAt: 1 }).lean(),
    Appointment.find({ owner: user._id }).lean(),
    Document.find({ pet: { $in: petIds } }).lean(),
    Medication.find({ owner: user._id }).lean(),
    MedicationDose.find({ pet: { $in: petIds } }).lean(),
    Expense.find({ owner: user._id }).sort({ date: 1 }).lean(),
    ShareLink.find({ owner: user._id }).select('-token').lean(),
  ]);

  const exportedAt = new Date();
  res.setHeader('Content-Disposition', `attachment; filename="pawprint-data-${exportedAt.toISOString().slice(0, 10)}.json"`);
  res.json({
    format: 'pawprint-export',
    version: 1,
    exportedAt,
    account: { ...toPublicUser(user), createdAt: user.createdAt },
    pets: pets.map(strip),
    vaccinations: vaccinations.map(strip),
    weights: weights.map(strip),
    appointments: appointments.map(strip),
    documents: documents.map(strip),
    medications: medications.map(strip),
    medicationDoses: doses.map(strip),
    expenses: expenses.map(strip),
    shareLinks: shares.map(strip),
  });
});

module.exports = { register, login, me, google, updateMe, changePassword, deleteMe, forgotPassword, resetPassword, exportData };
