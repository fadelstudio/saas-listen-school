import { Request, Response, NextFunction } from 'express';
import { systemService } from './system.service';
import { UpdateSystemSettingsInput } from './system.schema';
import { aiBalancer } from '../../core/ai/AiBalancer';
import { BadRequestError } from '../../core/errors/AppError';

export const systemController = {
  async getPublicSettings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const settings = await systemService.getPublicSettings(req.schoolId);
      res.sendSuccess('Public settings fetched', settings);
    } catch (error) {
      next(error);
    }
  },

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) throw new BadRequestError('schoolId is required');
      const settings = await systemService.getSettings(schoolId);
      res.sendSuccess('Settings fetched successfully', settings);
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) throw new BadRequestError('schoolId context missing');
      const settings = await systemService.updateSettings(schoolId, req.body as UpdateSystemSettingsInput);
      res.sendSuccess('Settings updated successfully', settings);
    } catch (error) {
      next(error);
    }
  },

  async getAiStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await aiBalancer.getStatus(req.schoolId!);
      res.sendSuccess('AI status fetched successfully', status);
    } catch (error) {
      next(error);
    }
  },

  async getAiModels(_req: Request, res: Response, next: NextFunction) {
    try {
      const models = await systemService.getAvailableModels();
      res.sendSuccess('Available AI models fetched successfully', models);
    } catch (error) {
      next(error);
    }
  },

  async updateLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('Logo file is required');
      const result = await systemService.updateLogo(req.schoolId!, req.file);
      res.sendSuccess('Logo updated successfully', result);
    } catch (error) {
      next(error);
    }
  }
};
