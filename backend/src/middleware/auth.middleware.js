const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
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

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.sub;
    next();
  } catch {
    throw new ApiError(401, 'Token is invalid or has expired');
  }
});

module.exports = requireAuth;
