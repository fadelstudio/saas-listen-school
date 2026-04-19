import { Request, Response, NextFunction } from 'express';
import { evaluationCampaignsService } from './evaluation-campaigns.service';
import { BadRequestError } from '../../core/errors/AppError';

export const evaluationCampaignsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const campaign = await evaluationCampaignsService.create(req.body, req.schoolId);
      res.sendSuccess('Evaluation campaign created and students notified', campaign, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await evaluationCampaignsService.getAll(req.schoolId, req.query);
      res.sendSuccess('Campaigns retrieved', result.items, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const campaign = await evaluationCampaignsService.getById(req.params.id as string, req.schoolId);
      res.sendSuccess('Campaign details', campaign);
    } catch (error) {
      next(error);
    }
  },

  async close(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const campaign = await evaluationCampaignsService.close(req.params.id as string, req.schoolId);
      res.sendSuccess('Campaign closed', campaign);
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const data = await evaluationCampaignsService.getAnalytics(req.params.id as string, req.schoolId);
      res.sendSuccess('Analytics fetched', data);
    } catch (error) {
      next(error);
    }
  },

  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const data = await evaluationCampaignsService.generatePostDeadlineAnalysis(req.params.id as string, req.user!.userId, req.schoolId);
      res.sendSuccess('Analysis completed and decision created', data);
    } catch (error) {
      next(error);
    }
  },
};
