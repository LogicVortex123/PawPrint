require('dotenv').config();

// Only MONGO_URI and JWT_SECRET are truly required to boot.
// GOOGLE_CLIENT_ID is only needed if you want the Google Sign-In endpoint to work.
const required = ['MONGO_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const nodeEnv = process.env.NODE_ENV || 'development';

// A short or example secret makes every login token forgeable — refuse to run
// like that in production, and warn about it everywhere else
const weakSecret = process.env.JWT_SECRET.length < 32 || /replace-with|change-?me/i.test(process.env.JWT_SECRET);
if (weakSecret && nodeEnv === 'production') {
  throw new Error('JWT_SECRET is too weak for production — use a random string of at least 32 characters');
}
if (weakSecret && nodeEnv === 'development') {
  console.warn('[config] JWT_SECRET looks weak. Use a long random string before deploying.');
}

const webOrigins = (process.env.WEB_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  webOrigins,
  // Where links in emails (password reset, dashboard, shared records) point to
  appUrl: (process.env.APP_URL || webOrigins[0] || 'http://localhost:5173').replace(/\/$/, ''),
  // Behind a host's load balancer (Render, Railway...) set TRUST_PROXY=1 so rate
  // limits see the real client IP instead of the proxy's
  trustProxy: process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY : false,
  // Email / SMTP (Nodemailer) — reminder digests, appointment emails, password resets
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'PawPrint <noreply@pawprint.app>',
    enabled: process.env.EMAIL_REMINDERS_ENABLED !== 'false' && nodeEnv !== 'test',
  },
};
