/**
 * Global Express Error Handler
 * Returns standardized JSON error responses: { success: false, message: string }
 */
function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
