const bcrypt = require('bcrypt');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const { verifyGoogleToken } = require('../services/googleAuth.service');

const SALT_ROUNDS = 12;

function toPublicUser(user) {
  return { id: user._id, name: user.name, email: user.email, authProvider: user.authProvider };
}

// POST /auth/register — TR-003, TRD Security 9 (bcrypt-hashed, salted passwords)
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, authProvider: 'local' });

  const token = generateToken(user._id);
  res.status(201).json({ token, user: toPublicUser(user) });
});

// POST /auth/login — TR-003
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !user.passwordHash) throw new ApiError(401, 'Invalid email or password');

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) throw new ApiError(401, 'Invalid email or password');

  const token = generateToken(user._id);
  res.json({ token, user: toPublicUser(user) });
});

// POST /auth/google — TR-003 / TR-003b / TR-017 (shared by mobile expo-auth-session
// and web @react-oauth/google — both send a Google ID token to this one endpoint)
const google = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError(400, 'idToken is required');

  const { googleId, email, name } = await verifyGoogleToken(idToken);

  let user = await User.findOne({ googleId });
  if (!user) {
    user = await User.findOne({ email: email.toLowerCase() });
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

module.exports = { register, login, google };
