import { Request, Response, NextFunction } from "express";
export interface JwtPayload {
    userId: string;
    role: string;
    schoolId?: string | null;
    campusId?: string | null;
    classId?: string | null;
    iat: number;
    exp: number;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): void;
export declare function requireRole(...roles: string[]): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map