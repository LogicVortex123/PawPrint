const bcrypt = require('bcrypt');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const { verifyGoogleToken } = require('../services/googleAuth.service');

const SALT_ROUNDS = 12;

// Strip out sensitive/internal fields before sending user data to the client
function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    authProvider: user.authProvider,
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
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, 'User not found');
  res.json(toPublicUser(user));
});

// POST /auth/google — accepts a Google ID token from either the mobile app or web
const google = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError(400, 'idToken is required');

  const { googleId, email, name } = await verifyGoogleToken(idToken);

  let user = await User.findOne({ googleId });

  if (!user) {
    // Maybe they registered with email/password first — link the Google ID
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

module.exports = { register, login, me, google };
