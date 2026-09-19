const ApiError = require('../utils/ApiError');

function errorMiddleware(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

  if (statusCode >= 500) {
    // Full internal error (driver/OpenSSL text, stack traces, etc.) stays in
    // the server log only — it must never reach the client as-is, since it
    // can leak internal details and reads as a raw crash to the user.
    console.error(err);
  }

  const message = isApiError
    ? err.message
    : 'Something went wrong on our end. Please try again in a moment.';

  res.status(statusCode).json({ error: { message } });
}

module.exports = errorMiddleware;
