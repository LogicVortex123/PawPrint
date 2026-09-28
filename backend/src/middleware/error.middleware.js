const ApiError = require('../utils/ApiError');

// Known client-side mistakes from multer/mongoose, turned into readable 400s
// instead of falling through to the generic 500 below
function toClientError(err) {
  if (err.name === 'MulterError') {
    return new ApiError(400, err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 10 MB)' : 'Upload failed');
  }
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    return new ApiError(400, first?.message || 'Some fields are invalid');
  }
  if (err.name === 'CastError') return new ApiError(400, `Invalid value for ${err.path}`);
  return err;
}

function errorMiddleware(rawErr, req, res, next) {
  const err = toClientError(rawErr);
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
