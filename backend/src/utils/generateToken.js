const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

// TRD Security 9: JWT signed with a server-side secret, short expiry.
function generateToken(userId) {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
}

module.exports = generateToken;
