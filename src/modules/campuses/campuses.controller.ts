import { Request, Response, NextFunction } from 'express';
import { campusesService } from './campuses.service';

export const campusesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await campusesService.getAll(req.query);
      res.sendSuccess('Campuses fetched', result.items, 200, {
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
      const campus = await campusesService.getById(req.params.id as string);
      res.sendSuccess('Campus fetched', campus);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const campus = await campusesService.create(req.body);
      res.sendSuccess('Campus created', campus, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const campus = await campusesService.update(req.params.id as string, req.body);
      res.sendSuccess('Campus updated', campus);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await campusesService.delete(req.params.id as string);
      res.sendSuccess('Campus deleted', null);
    } catch (error) {
      next(error);
    }
  },
};
