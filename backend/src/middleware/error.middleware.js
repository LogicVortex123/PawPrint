const ApiError = require('../utils/ApiError');

function errorMiddleware(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message: err.message || 'Something went wrong on our end',
    },
  });
}

module.exports = errorMiddleware;
