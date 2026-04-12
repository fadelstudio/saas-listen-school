import { Request, Response, NextFunction } from 'express';
import { systemService } from './system.service';
import { UpdateSystemSettingsInput } from './system.schema';
import { aiBalancer } from '../../core/ai/AiBalancer';

export const systemController = {
  async getSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await systemService.getSettings();
      res.sendSuccess('Settings fetched successfully', settings);
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await systemService.updateSettings(req.body as UpdateSystemSettingsInput);
      res.sendSuccess('Settings updated successfully', settings);
    } catch (error) {
      next(error);
    }
  },

  async getAiStatus(_req: Request, res: Response, next: NextFunction) {
    try {
      const status = aiBalancer.getStatus();
      res.sendSuccess('AI status fetched successfully', status);
    } catch (error) {
      next(error);
    }
  }
};
