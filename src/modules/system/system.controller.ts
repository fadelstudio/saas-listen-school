import { Request, Response, NextFunction } from 'express';
import { systemService } from './system.service';
import { UpdateSystemSettingsInput } from './system.schema';
import { aiBalancer } from '../../core/ai/AiBalancer';

export const systemController = {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId || (req.query.schoolId as string);
      if (!schoolId) throw new Error('schoolId is required');
      const settings = await systemService.getSettings(schoolId);
      res.sendSuccess('Settings fetched successfully', settings);
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      if (!schoolId) throw new Error('schoolId context missing');
      const settings = await systemService.updateSettings(schoolId, req.body as UpdateSystemSettingsInput);
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
