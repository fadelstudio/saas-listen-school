import { Request, Response, NextFunction } from 'express';
import { evaluationsService } from './evaluations.service';
import { BadRequestError } from '../../core/errors/AppError';

export const evaluationsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await evaluationsService.create(req.body, userId, req.schoolId);
      res.sendSuccess('Evaluation created', result, 201);
    } catch (error) { next(error); }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await evaluationsService.getAll(
        req.query as Record<string, unknown>,
        req.user?.role,
        req.schoolId
      );
      res.sendSuccess('Evaluations fetched', result.items, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await evaluationsService.getById(
        req.params.id as string,
        req.user?.role,
        req.schoolId
      );
      res.sendSuccess('Evaluation fetched', result);
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await evaluationsService.update(
        req.params.id as string, req.body, req.user!.userId, req.user!.role, req.schoolId
      );
      res.sendSuccess('Evaluation updated', result);
    } catch (error) { next(error); }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      await evaluationsService.delete(req.params.id as string, req.user!.role, req.schoolId);
      res.sendSuccess('Evaluation deleted', null);
    } catch (error) { next(error); }
  },

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await evaluationsService.getStats(req.query as Record<string, unknown>, req.schoolId);
      res.sendSuccess('Evaluation stats', result);
    } catch (error) { next(error); }
  },

  async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await evaluationsService.triggerAiScoring(
        req.params.id as string,
        req.user!.role,
        req.schoolId
      );
      res.sendSuccess('AI scoring job queued', result);
    } catch (error) { next(error); }
  },
};
