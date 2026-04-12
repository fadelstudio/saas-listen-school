import { Request, Response, NextFunction } from 'express';
import { professorsService } from './professors.service';

export const professorsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await professorsService.getAll(req.query);
      res.sendSuccess('Professors fetched', result.items, 200, {
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
      const professor = await professorsService.getById(req.params.id as string);
      res.sendSuccess('Professor fetched', professor);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const professor = await professorsService.create(req.body);
      res.sendSuccess('Professor created', professor, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const professor = await professorsService.update(req.params.id as string, req.body);
      res.sendSuccess('Professor updated', professor);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await professorsService.delete(req.params.id as string);
      res.sendSuccess('Professor deleted', null);
    } catch (error) {
      next(error);
    }
  },
};
