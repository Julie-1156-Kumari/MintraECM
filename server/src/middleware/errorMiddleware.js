import ApiError from '../utils/apiError.js';
import { redactSecrets } from '../utils/redact.js';

/**
 * Catch 404 routes that were not matched by any router.
 */
export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Not Found - ${req.method} ${req.originalUrl}`));
};

/**
 * Central error-handling middleware. Returns a consistent JSON error payload.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode;
  if (!statusCode || statusCode === 200) {
    statusCode = 500;
  }

  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors || {}).map((e) => e.message);
    message = 'Validation failed';
  }

  const isProduction = process.env.NODE_ENV === 'production';

  console.error('[Error]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    status: statusCode,
    message: redactSecrets(message),
    stack: redactSecrets(err.stack || ''),
  });

  res.status(statusCode).json({
    success: false,
    message: isProduction ? redactSecrets(message) : message,
    errors: errors.length ? errors : undefined,
    stack: isProduction ? undefined : err.stack,
  });
};
