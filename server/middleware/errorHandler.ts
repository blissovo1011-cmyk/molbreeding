import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ success: false, error: 'Invalid JSON in request body' });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
}
