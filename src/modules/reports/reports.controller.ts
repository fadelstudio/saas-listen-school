import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { ReportStatus } from '@prisma/client';
import { BadRequestError } from '../../core/errors/AppError';

export const reportsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId; // may be undefined (anonymous)
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const report = await reportsService.create(req.body, userId, req.schoolId);
      res.sendSuccess('Report created successfully', report, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await reportsService.getAll(
        req.query as Record<string, unknown>,
        req.user?.role,
        req.schoolId
      );
      res.sendSuccess('Reports fetched', result.items, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const report = await reportsService.getById(
        req.params.id as string,
        req.user?.role,
        req.schoolId
      );
      res.sendSuccess('Report fetched', report);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const report = await reportsService.update(
        req.params.id as string,
        req.body,
        req.user!.userId,
        req.user!.role,
        req.schoolId
      );
      res.sendSuccess('Report updated', report);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const report = await reportsService.updateStatus(
        req.params.id as string,
        req.body.status as ReportStatus,
        req.user!.role,
        req.schoolId
      );
      res.sendSuccess('Report status updated', report);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      await reportsService.delete(req.params.id as string, req.user!.role, req.schoolId);
      res.sendSuccess('Report deleted', null);
    } catch (error) {
      next(error);
    }
  },

  async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await reportsService.triggerAiAnalysis(
        req.params.id as string,
        req.user!.role,
        req.schoolId
      );
      res.sendSuccess('AI analysis job queued', result);
    } catch (error) {
      next(error);
    }
  },

  async getMyReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const userId = req.user!.userId;
      const result = await reportsService.getMyReports(userId, req.query as Record<string, unknown>, req.schoolId);
      res.sendSuccess('My reports fetched', result.items, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });
    } catch (error) {
      next(error);
    }
  },
};
