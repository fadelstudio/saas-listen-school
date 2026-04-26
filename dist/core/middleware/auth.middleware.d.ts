import { Request, Response, NextFunction } from "express";
export interface JwtPayload {
    userId: string;
    role: string;
    sid?: string;
    schoolId?: string | null;
    campusIds?: string[];
    classId?: string | null;
    iat: number;
    exp: number;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
            schoolId?: string;
            school?: {
                id: string;
                slug: string;
                name: string;
                domain: string | null;
            };
        }
    }
}
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requireRole(...roles: string[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare const authenticate: typeof authMiddleware;
export declare const authorize: typeof requireRole;
//# sourceMappingURL=auth.middleware.d.ts.map