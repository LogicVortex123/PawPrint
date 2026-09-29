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
    throw new ApiError(401, 'Authorization header is missing or malformed');
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new ApiError(401, 'Token is invalid or has expired');
  }

  // A valid token can outlive its account (deleted in Settings) — treat that as
  // signed out, so the client clears the session instead of getting 404s
  if (!(await User.exists({ _id: payload.sub }))) {
    throw new ApiError(401, 'This account no longer exists');
  }

  req.userId = payload.sub;
  next();
});

module.exports = requireAuth;
