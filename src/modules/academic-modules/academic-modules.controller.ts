import { Request, Response, NextFunction } from 'express';
import { academicModulesService } from './academic-modules.service';

export const academicModulesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await academicModulesService.getAll(req.query);
      res.sendSuccess('Academic Modules fetched', result.items, 200, {
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
      const mod = await academicModulesService.getById(req.params.id as string);
      res.sendSuccess('Academic Module fetched', mod);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await academicModulesService.create(req.body);
      res.sendSuccess('Academic Module created', mod, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await academicModulesService.update(req.params.id as string, req.body);
      res.sendSuccess('Academic Module updated', mod);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await academicModulesService.delete(req.params.id as string);
      res.sendSuccess('Academic Module deleted', null);
    } catch (error) {
      next(error);
    }
  },
};
