import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { BadRequestError } from '../../core/errors/AppError';

export const analyticsController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const campusId = req.query.campusId as string | undefined;
      const stats = await analyticsService.getDashboardStats(req.schoolId, campusId);
      res.sendSuccess('Dashboard analytics fetched', stats);
    } catch (error) {
      next(error);
    }
  },

  async generateGlobalAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await analyticsService.generateGlobalAnalysis(
        req.body,
        req.user!.userId,
        req.schoolId
      );
      res.sendSuccess('Global analysis triggered and report generated', result);
    } catch (error) {
      next(error);
    }
  },
};
