require('dotenv').config();

// MONGO_URI and JWT_SECRET are required in every environment.
// Production also requires WEB_ORIGIN (see below).
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
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

// The browser sends this origin on every API call. Without it, production CORS
// rejects the web app and the deployed site looks like a network failure.
if (nodeEnv === 'production') {
  if (webOrigins.length === 0) {
    throw new Error('WEB_ORIGIN is required in production — set it to the web app origin, for example https://your-app.vercel.app');
  }
  for (const origin of webOrigins) {
    if (origin === '*' || !/^https:\/\/[^/]+$/.test(origin)) {
      throw new Error(`WEB_ORIGIN must be an https origin with no path (got ${origin})`);
    }
  }
}

// Render (and similar hosts) set X-Forwarded-For. express-rate-limit rejects
// those requests unless Express trusts the proxy, so production defaults to
// trusting the first hop. Set TRUST_PROXY=0 to turn that off.
function resolveTrustProxy() {
  const raw = process.env.TRUST_PROXY;
  if (raw === undefined || raw.trim() === '') return nodeEnv === 'production' ? 1 : false;
  if (raw === 'false' || raw === '0') return false;
  if (raw === 'true') return 1;
  const asNumber = Number(raw);
  return Number.isNaN(asNumber) ? raw : asNumber;
}

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
  trustProxy: resolveTrustProxy(),
  // IANA timezone for the 08:00 reminder cron. Unset = the server's own clock
  // (UTC on Render). Example: Asia/Kolkata
  reminderCronTz: (process.env.REMINDER_CRON_TZ || '').trim(),
  // Import real vet clinics from OpenStreetMap for areas people search in
  clinicImport: process.env.CLINIC_IMPORT !== 'false' && nodeEnv !== 'test',
  // PawPal chat assistant. With an Anthropic API key it answers with Claude;
  // without one it still works, answering from the pet's records with
  // built-in replies.
  assistant: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ASSISTANT_MODEL || 'claude-opus-5-5',
  },
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
