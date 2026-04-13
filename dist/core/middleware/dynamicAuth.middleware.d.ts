import { Request, Response, NextFunction } from 'express';
export type ProtectedType = 'reports' | 'evaluations';
/**
 * Dynamic Auth Middleware
 * Checks SystemSettings to decide if auth is mandatory or optional for a given type.
 */
export declare function dynamicAuthMiddleware(type: ProtectedType): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=dynamicAuth.middleware.d.ts.map