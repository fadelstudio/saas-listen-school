import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';

export const analyticsController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const campusId = req.query.campusId as string | undefined;
      const stats = await analyticsService.getDashboardStats(campusId);
      res.sendSuccess('Dashboard analytics fetched', stats);
    } catch (error) {
      next(error);
    }
  }
};
