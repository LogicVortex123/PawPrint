const bcrypt = require('bcrypt');
const User = require('../models/User.model');
const Pet = require('../models/Pet.model');
const Vaccination = require('../models/Vaccination.model');
const WeightRecord = require('../models/WeightRecord.model');
const Document = require('../models/Document.model');
const Appointment = require('../models/Appointment.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const { verifyGoogleToken } = require('../services/googleAuth.service');
const { removeUploadedFile } = require('../services/uploadFiles.service');

const SALT_ROUNDS = 12;

// Strip out sensitive/internal fields before sending user data to the client
function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    authProvider: user.authProvider,
    hasPassword: Boolean(user.passwordHash),
    preferences: user.preferences,
  };
}

// POST /auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are all required');
  }

  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
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

  if (!email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  // passwordHash is excluded by default in the schema — need to select it explicitly
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

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
  if (!idToken) throw new ApiError(400, 'idToken is required');

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
  if (name !== undefined) {
    if (!String(name).trim()) throw new ApiError(400, 'Name cannot be empty');
    user.name = String(name).trim();
  }
  if (preferences?.reminders) {
    for (const key of ['vaccination', 'appointment', 'weight']) {
      if (typeof preferences.reminders[key] === 'boolean') user.preferences.reminders[key] = preferences.reminders[key];
    }
  }
  if (preferences?.reminderLeadDays !== undefined) user.preferences.reminderLeadDays = preferences.reminderLeadDays;

  await user.save();
  res.json(toPublicUser(user));
});

// PUT /auth/password — change password; Google-only accounts can set a first one
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters');
  }

  const user = await User.findById(req.userId).select('+passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  if (user.passwordHash) {
    const matches = currentPassword && (await bcrypt.compare(currentPassword, user.passwordHash));
    if (!matches) throw new ApiError(400, 'Current password is incorrect');
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
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
    Pet.deleteMany({ owner: user._id }),
  ]);
  await user.deleteOne();

  await Promise.all([...pets.map((p) => p.photoUrl), ...documents.map((d) => d.fileUrl)].map(removeUploadedFile));
  res.status(204).send();
});

module.exports = { register, login, me, google, updateMe, changePassword, deleteMe };
