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
export declare const responseMiddleware: (_req: Request, res: Response, next: NextFunction) => void;
declare global {
    namespace Express {
        interface Response {
            sendSuccess<T = unknown>(message: string, data?: T | null, statusCode?: number, meta?: ApiMeta): Response;
            sendError(message: string, statusCode?: number, error?: unknown): Response;
        }
    }
}
//# sourceMappingURL=response.middleware.d.ts.map