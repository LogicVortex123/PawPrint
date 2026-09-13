const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// TRD Security 9 (API authorization): every protected endpoint verifies the
// JWT before touching MongoDB. Applied to every route except /auth/*.
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw new ApiError(401, 'Missing or invalid Authorization header');

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.sub;
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

module.exports = requireAuth;
