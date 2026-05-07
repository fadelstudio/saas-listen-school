import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { BadRequestError } from '../../core/errors/AppError';

export const analyticsController = {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const campusId = req.query.campusId as string | undefined;
      const scopedCampusIds = analyticsService.resolveScopedCampusIds(req.user?.role, req.user?.campusIds, campusId);
      const stats = await analyticsService.getDashboardStats(req.schoolId, scopedCampusIds);
      res.sendSuccess('Analytics dashboard stats fetched', stats);
    } catch (error) {
      next(error);
    }
  },

  async getTimeSeriesStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const campusId = req.query.campusId as string | undefined;
      const period = (req.query.period as any) || 'week';
      const scopedCampusIds = analyticsService.resolveScopedCampusIds(req.user?.role, req.user?.campusIds, campusId);
      const stats = await analyticsService.getTimeSeriesStats(req.schoolId, period, scopedCampusIds);
      res.sendSuccess('Time series stats fetched', stats);
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
      res.sendSuccess('Global analysis report generated successfully', result);
    } catch (error) {
      next(error);
    }
  },

  async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const limit = req.query.limit ? parseInt(req.query.limit as any) : undefined;
      const page = req.query.page ? parseInt(req.query.page as any) : undefined;
      const periodic = req.query.periodic === 'true' ? true : (req.query.periodic === 'false' ? false : undefined);
      const q = req.query.q as string;
      const result = await analyticsService.getReports(req.schoolId, { limit, page, periodic, q });
      res.sendSuccess('Analysis reports fetched', result);
    } catch (error) {
      next(error);
    }
  },

  async getReportById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const report = await analyticsService.getReportById(req.params.id as string, req.schoolId);
      res.sendSuccess('Analysis report details fetched', report);
    } catch (error) {
      next(error);
    }
  },

  async generatePeriodicReport(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await analyticsService.generatePeriodicReport(
        req.schoolId,
        req.user!.userId
      );
      res.sendSuccess('Periodic analysis report generated successfully', result);
    } catch (error) {
      next(error);
    }
  },
};
