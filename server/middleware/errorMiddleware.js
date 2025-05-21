// server/middleware/errorMiddleware.js

// 404 Not Found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // If response status is 200 but we have an error, set it to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log detailed error information in development
  if (process.env.NODE_ENV !== 'production') {
    console.error({
      message: err.message,
      stack: err.stack,
      name: err.name,
      path: req.path,
      method: req.method
    });
  } else {
    // Simplified logging for production
    console.error(`${err.name}: ${err.message} (${req.method} ${req.path})`);
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    // Include additional error details if available
    errors: err.errors,
    code: err.code
  });
};

// Async handler to catch rejected promises in route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { notFound, errorHandler, asyncHandler };