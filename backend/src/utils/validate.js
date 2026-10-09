// Small input helpers shared by controllers. Requests are sanitised of "$"
// operators by security.middleware, but values can still be the wrong type
// (an object where a string is expected) — these turn that into a clear 400
// instead of a crash, and whitelist which fields a request may set.

const ApiError = require('./ApiError');

// Copy only the allowed keys that were actually sent
function pick(source, keys) {
  const out = {};
  for (const key of keys) {
    if (source && Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) out[key] = source[key];
  }
  return out;
}

function requireString(value, field, { max = 200 } = {}) {
  if (typeof value !== 'string' || !value.trim()) throw new ApiError(400, `${field} is required`);
  if (value.trim().length > max) throw new ApiError(400, `${field} must be ${max} characters or fewer`);
  return value.trim();
}

function optionalString(value, field, { max = 500 } = {}) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') throw new ApiError(400, `${field} must be text`);
  if (value.trim().length > max) throw new ApiError(400, `${field} must be ${max} characters or fewer`);
  return value.trim();
}

function requireNumber(value, field, { min = -Infinity, max = Infinity } = {}) {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) throw new ApiError(400, `${field} must be a number`);
  if (n < min || n > max) throw new ApiError(400, `${field} must be between ${min} and ${max}`);
  return n;
}

function requireDate(value, field) {
  const d = new Date(value);
  if (value === undefined || value === null || value === '' || Number.isNaN(d.getTime())) {
    throw new ApiError(400, `${field} must be a valid date`);
  }
  return d;
}

function isEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = { pick, requireString, optionalString, requireNumber, requireDate, isEmail };
