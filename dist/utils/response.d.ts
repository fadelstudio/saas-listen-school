import { Response } from "express";
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T | null;
    error: unknown | null;
}
export declare function sendSuccess<T>(res: Response, message: string, data: T, statusCode?: number): Response;
export declare function sendError(res: Response, message: string, statusCode?: number, error?: unknown): Response;
export declare function sendCreated<T>(res: Response, message: string, data: T): Response;
//# sourceMappingURL=response.d.ts.map