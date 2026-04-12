import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { sendSuccess } from '../../utils/response';
import { ReportStatus } from '@prisma/client';

export const reportsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId; // may be undefined (anonymous)
      const report = await reportsService.create(req.body, userId);
      sendSuccess(res, 'Report created successfully', report, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await reportsService.getAll(req.query as Record<string, unknown>);
      sendSuccess(res, 'Reports fetched', result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportsService.getById(req.params.id as string);
      sendSuccess(res, 'Report fetched', report);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportsService.update(
        req.params.id as string,
        req.body,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, 'Report updated', report);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportsService.updateStatus(
        req.params.id as string,
        req.body.status as ReportStatus,
        req.user!.role
      );
      sendSuccess(res, 'Report status updated', report);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await reportsService.delete(req.params.id as string, req.user!.role);
      sendSuccess(res, 'Report deleted', null);
    } catch (error) {
      next(error);
    }
  },

  async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await reportsService.triggerAiAnalysis(req.params.id as string, req.user!.role);
      sendSuccess(res, 'AI analysis job queued', result);
    } catch (error) {
      next(error);
    }
  },
};
