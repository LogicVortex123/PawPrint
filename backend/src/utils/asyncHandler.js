// Wraps async controllers so rejected promises reach error.middleware.js
// instead of crashing the process or requiring a try/catch in every controller.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
