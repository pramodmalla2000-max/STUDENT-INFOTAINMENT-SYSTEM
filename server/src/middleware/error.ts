import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error Middleware]:', err);

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  let message = err.message || 'Internal Server Error';
  let errors = err.errors || undefined;

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value entered for field: ${field}. Please use another value.`;
    res.status(409).json({ success: false, message });
    return;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val: any) => val.message);
    res.status(422).json({ success: false, message, errors });
    return;
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Resource not found with specified ID: ${err.value}`;
    res.status(404).json({ success: false, message });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
