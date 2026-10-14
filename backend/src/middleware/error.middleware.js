const ApiError = require('../utils/ApiError');

// Known client-side mistakes from multer/mongoose, turned into readable 400s
// instead of falling through to the generic 500 below
function toClientError(err) {
  if (err.name === 'MulterError') {
    return new ApiError(400, err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 10 MB)' : 'Upload failed');
  }
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    // Mongoose's built-in messages ("Path `x` is required.") name internal fields — keep only our own wording
    const custom = first?.message && !/path `|^Cast to/i.test(first.message);
    return new ApiError(400, custom ? first.message : 'Please check the details you entered and try again.');
  }
  if (err.name === 'CastError') return new ApiError(400, "That item couldn't be found. Please refresh and try again.");
  if (err.type === 'entity.parse.failed') return new ApiError(400, 'Request body is not valid JSON');
  if (err.type === 'entity.too.large') return new ApiError(413, 'Request body is too large');
  if (err.code === 11000) return new ApiError(409, 'That record already exists');
  if (/^Origin .* not allowed$/.test(err.message || '')) return new ApiError(403, "This website can't connect to PawPrint.");
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
