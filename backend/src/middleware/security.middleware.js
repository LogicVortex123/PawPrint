const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { isTest } = require('../config/env');

// ── NoSQL injection guard ─────────────────────────────────────────────────────
// Mongo treats keys like "$gt" or "$set" as operators. A body such as
// { "email": { "$gt": "" } } or { "$set": { "owner": "..." } } must never reach a
// query or update, so any key starting with "$" (or containing ".") is dropped
// from the body, query string and URL params before controllers see them.
function stripOperators(value, depth = 0) {
  if (depth > 20 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => stripOperators(v, depth + 1));
  // Leave Buffers, Dates etc. alone — only plain JSON objects are cleaned
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return value;

  const clean = {};
  for (const [key, v] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    clean[key] = stripOperators(v, depth + 1);
  }
  return clean;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') req.body = stripOperators(req.body);
  // req.query is a getter in newer Express versions — clean its keys in place
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$') || key.includes('.')) delete req.query[key];
      else if (typeof req.query[key] === 'object') req.query[key] = stripOperators(req.query[key]);
    }
  }
  next();
}

// ── Security headers ──────────────────────────────────────────────────────────
// This server only returns JSON and uploaded files, so the browser-facing CSP
// lives with the web app's host. crossOriginResourcePolicy is relaxed because
// the web app (another origin) displays pet photos served from /uploads.
const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// ── Rate limits ───────────────────────────────────────────────────────────────
const limiter = (options) => rateLimit({
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => isTest,
  handler: (req, res, next, opts) => res.status(opts.statusCode).json({ error: { message: opts.message } }),
  ...options,
});

// Password guessing: 10 failed-or-not attempts per 15 minutes per IP
const authLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many sign-in attempts. Please wait 15 minutes and try again.',
});

// Endpoints that send email (password reset) — stops inbox flooding
const emailLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: 'Too many requests. Please wait a while before asking for another email.',
});

// Public share links — stops anyone scraping tokens by brute force
const publicLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  message: 'Too many requests. Please slow down.',
});

// Everything else: a generous ceiling so one runaway client can't hog the API
const apiLimiter = limiter({
  windowMs: 60 * 1000,
  limit: 300,
  message: 'Too many requests. Please slow down.',
});

module.exports = { sanitizeInput, stripOperators, securityHeaders, authLimiter, emailLimiter, publicLimiter, apiLimiter };
