import { Request, Response, NextFunction } from 'express';
import { saasService } from './saas.service';
import { sendSuccess } from '../../utils/response';

export const saasController = {
  async createSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await saasService.createSchool(req.body);
      sendSuccess(res, 'School created and Admin assigned successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }
};
