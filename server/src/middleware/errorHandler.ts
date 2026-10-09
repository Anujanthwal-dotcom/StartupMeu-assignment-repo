import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Global error-handling middleware.
 * Must be the last middleware registered in index.ts (4 params).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Operational errors thrown by services
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose duplicate key error (e.g. unique email)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  if (anyErr.code === 11000) {
    const field = Object.keys(anyErr.keyValue ?? {})[0] ?? 'field';
    res.status(409).json({
      success: false,
      message: `A record with that ${field} already exists`,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(anyErr.errors ?? {})
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((e: any) => e.message)
      .join(', ');
    res.status(422).json({
      success: false,
      message: messages,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token has expired' });
    return;
  }

  // Unknown / programming errors — don't leak internals in production
  console.error('[Unhandled Error]', err);
  const message =
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';

  res.status(500).json({ success: false, message });
}
