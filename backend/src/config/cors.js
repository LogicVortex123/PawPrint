const { webOrigins, nodeEnv } = require('./env');

// Vite moves to 5174, 5175… when 5173 is busy, so in dev any local port is accepted
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// In production, only requests coming from the listed WEB_ORIGIN(s) are allowed.
// In dev, if WEB_ORIGIN isn't set at all, every origin passes through so you don't
// have to fiddle with env vars just to hit the API from localhost.
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (webOrigins.includes(origin)) return callback(null, true);
    if (nodeEnv !== 'production' && (!webOrigins.length || LOCAL_ORIGIN.test(origin))) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed`));
  },
  credentials: true,
  // Lets the web app read the download name (e.g. pawprint-expenses-2026.csv) on cross-origin downloads
  exposedHeaders: ['Content-Disposition'],
};

module.exports = corsOptions;
