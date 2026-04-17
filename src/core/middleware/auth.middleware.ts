import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError";
import { prisma } from "../database/prisma";

export interface JwtPayload {
  userId: string;
  role: string;
  schoolId?: string | null;
  campusId?: string | null;
  classId?: string | null;
  iat: number;
  exp: number;
}

// Extend Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or malformed authorization header");
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (payload.role !== "SUPERADMIN" && !payload.schoolId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          schoolId: true,
          campus: { select: { schoolId: true } },
        },
      });
      const resolvedSchoolId = user?.schoolId || user?.campus?.schoolId || null;
      if (!resolvedSchoolId) {
        throw new UnauthorizedError("Token missing school context. Please log in again.");
      }
      payload.schoolId = resolvedSchoolId;
    }
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // SUPERADMIN can access everything
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
    next();
  };
}
