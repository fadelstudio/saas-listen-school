import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../../modules/auth/auth.types';
import { systemService } from '../../modules/system/system.service';
import { UnauthorizedError } from '../errors/AppError';

export type ProtectedType = 'reports' | 'evaluations';

/**
 * Dynamic Auth Middleware
 * Checks SystemSettings to decide if auth is mandatory or optional for a given type.
 */
export function dynamicAuthMiddleware(type: ProtectedType) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      let schoolId = req.query.schoolId as string;
      
      if (!schoolId && req.body.campusId) {
        const campus = await systemService.getSchoolSettingsByCampus(req.body.campusId as string);
        schoolId = campus?.schoolId || '';
      }

      if (!schoolId) {
        // Fallback for types that don't have school context yet in request
        return next(); 
      }

      const settings = await systemService.getSettings(schoolId);
      
      const isRequired = 
        (type === 'reports' && settings.authReportsRequired) || 
        (type === 'evaluations' && settings.authEvaluationsRequired);

      const authHeader = req.headers.authorization;

      // Case 1: No token provided
      if (!authHeader?.startsWith('Bearer ')) {
        if (isRequired) {
          throw new UnauthorizedError(`Authentication required for ${type} submission`);
        }
        return next(); // Continue as anonymous
      }

      // Case 2: Token provided - try to verify
      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = payload;
      } catch (error) {
        if (isRequired) {
          throw new UnauthorizedError('Invalid or expired token');
        }
        // If optional and invalid token, just continue as anonymous
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
