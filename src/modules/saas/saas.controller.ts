import { Request, Response, NextFunction } from 'express';
import { saasService } from './saas.service';

export const saasController = {
  async createSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await saasService.createSchool(req.body);
      res.sendSuccess('School created and Admin assigned successfully', result, 201);
    } catch (error) {
      next(error);
    }
  },

  async listSchools(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schools = await saasService.listSchools();
      res.sendSuccess('Schools retrieved successfully', schools);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await saasService.getSchoolById(req.params.id as string);
      res.sendSuccess('School retrieved successfully', school);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await saasService.updateSchool(req.params.id as string, req.body);
      res.sendSuccess('School updated successfully', school);
    } catch (error) {
      next(error);
    }
  }
};
