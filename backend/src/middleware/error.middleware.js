const ApiError = require('../utils/ApiError');

// Observability Section 10: Express error-handling middleware + log output.
function errorMiddleware(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  if (statusCode >= 500) {
    console.error(err);
  }
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal server error',
    },
  });
}

module.exports = errorMiddleware;
