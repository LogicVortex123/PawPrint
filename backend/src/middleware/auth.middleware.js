const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Checks the Authorization header on every protected route.
// If the token is missing or tampered with, the request stops here.
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Please log in to continue.');
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again.');
  }

  // A valid token can outlive its account (deleted in Settings) — treat that as
  // signed out, so the client clears the session instead of getting 404s
  if (!(await User.exists({ _id: payload.sub }))) {
    throw new ApiError(401, 'This account no longer exists');
  }

  req.userId = payload.sub;
  next();
});

// For endpoints that work signed out too (the chat assistant): a valid token
// sets req.userId, a missing or invalid one carries on as a guest. A database
// error still fails the request, so a signed-in user is never silently a guest.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  let payload = null;
  if (token) {
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch {
      // expired or tampered — treat as a guest
    }
  }
  if (payload && (await User.exists({ _id: payload.sub }))) req.userId = payload.sub;
  next();
});

module.exports = requireAuth;
module.exports.optionalAuth = optionalAuth;
