import { Request, Response, NextFunction } from 'express';
import { systemService } from './system.service';
import { sendSuccess } from '../../utils/response';
import { UpdateSystemSettingsInput } from './system.schema';
import { aiBalancer } from '../../core/ai/AiBalancer';

export const systemController = {
  async getSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await systemService.getSettings();
      sendSuccess(res, 'Settings fetched successfully', settings);
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await systemService.updateSettings(req.body as UpdateSystemSettingsInput);
      sendSuccess(res, 'Settings updated successfully', settings);
    } catch (error) {
      next(error);
    }
  },

  async getAiStatus(_req: Request, res: Response, next: NextFunction) {
    try {
      const status = aiBalancer.getStatus();
      sendSuccess(res, 'AI status fetched successfully', status);
    } catch (error) {
      next(error);
    }
  }
};
