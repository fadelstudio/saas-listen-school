import { Request, Response, NextFunction } from 'express';

/**
 * Standard API Response Format
 */
export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface StandardResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error: unknown | null;
  meta?: ApiMeta;
}

/**
 * Global middleware to attach helper methods to the response object.
 * This ensures all controllers use the same format.
 */
export const responseMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  // Success helper
  res.sendSuccess = <T = unknown>(message: string, data: T | null = null, statusCode = 200, meta?: ApiMeta) => {
    const payload: StandardResponse<T> = {
      success: true,
      message,
      data,
      error: null,
      meta,
    };

    return res.status(statusCode).json(payload);
  };

  // Error helper
  res.sendError = (message: string, statusCode = 500, error: unknown = null) => {
    const payload: StandardResponse<null> = {
      success: false,
      message,
      data: null,
      error,
    };

    return res.status(statusCode).json(payload);
  };

  next();
};

// Extend Express.Response type
declare global {
  namespace Express {
    interface Response {
      sendSuccess<T = unknown>(message: string, data?: T | null, statusCode?: number, meta?: ApiMeta): Response;
      sendError(message: string, statusCode?: number, error?: unknown): Response;
    }
  }
}
