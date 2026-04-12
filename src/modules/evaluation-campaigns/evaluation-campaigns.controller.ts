import { Request, Response, NextFunction } from 'express';
import { evaluationCampaignsService } from './evaluation-campaigns.service';

export const evaluationCampaignsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await evaluationCampaignsService.create(req.body);
      res.sendSuccess('Evaluation campaign created and students notified', campaign, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await evaluationCampaignsService.getAll(req.query);
      res.sendSuccess('Campaigns retrieved', result.items, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await evaluationCampaignsService.getById(req.params.id as string);
      res.sendSuccess('Campaign details', campaign);
    } catch (error) {
      next(error);
    }
  },

  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await evaluationCampaignsService.close(req.params.id as string);
      res.sendSuccess('Campaign closed', campaign);
    } catch (error) {
      next(error);
    }
  }
};
