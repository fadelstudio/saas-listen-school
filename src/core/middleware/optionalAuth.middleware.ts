import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../../modules/auth/auth.types';

/**
 * Optional auth middleware.
 * If a valid Bearer token is present → injects req.user.
 * If no token or invalid → continues without req.user (does NOT block).
 * Use on routes that support both authenticated and anonymous submissions.
 */
export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(); // anonymous — continue without user
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
  } catch {
    // Invalid token — treat as anonymous, do not reject
  }

  next();
}
