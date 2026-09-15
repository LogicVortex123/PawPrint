require('dotenv').config();

// Only MONGO_URI and JWT_SECRET are truly required to boot.
// GOOGLE_CLIENT_ID is only needed if you want the Google Sign-In endpoint to work.
const required = ['MONGO_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  webOrigins: (process.env.WEB_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
