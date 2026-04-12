import { Request, Response, NextFunction } from 'express';
import { professorsService } from './professors.service';
import { sendSuccess } from '../../utils/response';

export const professorsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await professorsService.getAll(req.query);
      sendSuccess(res, 'Professors fetched', result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const professor = await professorsService.getById(req.params.id as string);
      sendSuccess(res, 'Professor fetched', professor);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const professor = await professorsService.create(req.body);
      sendSuccess(res, 'Professor created', professor, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const professor = await professorsService.update(req.params.id as string, req.body);
      sendSuccess(res, 'Professor updated', professor);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await professorsService.delete(req.params.id as string);
      sendSuccess(res, 'Professor deleted', null);
    } catch (error) {
      next(error);
    }
  },
};
