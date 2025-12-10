import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors.js';

/**
 * Middleware to handle validation errors from express-validator
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
      ...(error.value !== undefined && { value: error.value }),
    }));
    
    const appError = new AppError('Validation failed', 400);
    (appError as any).details = validationErrors;
    
    throw appError;
  }
  
  next();
};
