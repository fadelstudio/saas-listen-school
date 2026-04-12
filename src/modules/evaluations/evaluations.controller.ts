import { Request, Response, NextFunction } from 'express';
import { evaluationsService } from './evaluations.service';
import { sendSuccess } from '../../utils/response';

export const evaluationsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await evaluationsService.create(req.body, userId);
      sendSuccess(res, 'Evaluation created', result, 201);
    } catch (error) { next(error); }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await evaluationsService.getAll(req.query as Record<string, unknown>);
      sendSuccess(res, 'Evaluations fetched', result);
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await evaluationsService.getById(req.params.id as string);
      sendSuccess(res, 'Evaluation fetched', result);
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await evaluationsService.update(
        req.params.id as string, req.body, req.user!.userId, req.user!.role
      );
      sendSuccess(res, 'Evaluation updated', result);
    } catch (error) { next(error); }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await evaluationsService.delete(req.params.id as string, req.user!.role);
      sendSuccess(res, 'Evaluation deleted', null);
    } catch (error) { next(error); }
  },

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await evaluationsService.getStats(req.query as Record<string, unknown>);
      sendSuccess(res, 'Evaluation stats', result);
    } catch (error) { next(error); }
  },

  async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await evaluationsService.triggerAiScoring(req.params.id as string, req.user!.role);
      sendSuccess(res, 'AI scoring job queued', result);
    } catch (error) { next(error); }
  },
};
