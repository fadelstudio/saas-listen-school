import { Request, Response, NextFunction } from 'express';
import { academicModulesService } from './academic-modules.service';
import { sendSuccess } from '../../utils/response';

export const academicModulesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await academicModulesService.getAll(req.query);
      sendSuccess(res, 'Academic Modules fetched', result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await academicModulesService.getById(req.params.id as string);
      sendSuccess(res, 'Academic Module fetched', mod);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await academicModulesService.create(req.body);
      sendSuccess(res, 'Academic Module created', mod, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await academicModulesService.update(req.params.id as string, req.body);
      sendSuccess(res, 'Academic Module updated', mod);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await academicModulesService.delete(req.params.id as string);
      sendSuccess(res, 'Academic Module deleted', null);
    } catch (error) {
      next(error);
    }
  },
};
