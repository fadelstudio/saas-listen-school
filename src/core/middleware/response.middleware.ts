import { Request, Response, NextFunction } from 'express';

/**
 * Standard API Response Format
 */
export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  error: any | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Global middleware to attach helper methods to the response object.
 * This ensures all controllers use the same format.
 */
export const responseMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  // Success helper
  res.sendSuccess = (message: string, data: any = null, statusCode = 200, meta?: any) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      error: null,
      meta,
    });
  };

  // Error helper
  res.sendError = (message: string, statusCode = 500, error: any = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      error,
    });
  };

  next();
};

// Extend Express.Response type
declare global {
  namespace Express {
    interface Response {
      sendSuccess(message: string, data?: any, statusCode?: number, meta?: any): Response;
      sendError(message: string, statusCode?: number, error?: any): Response;
    }
  }
}
