import { Request, Response, NextFunction } from 'express';
/**
 * Optional auth middleware.
 * If a valid Bearer token is present → injects req.user.
 * If no token or invalid → continues without req.user (does NOT block).
 * Use on routes that support both authenticated and anonymous submissions.
 */
export declare function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=optionalAuth.middleware.d.ts.map