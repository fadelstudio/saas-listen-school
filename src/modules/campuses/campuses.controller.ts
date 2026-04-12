import { Request, Response, NextFunction } from 'express';
import { campusesService } from './campuses.service';
import { sendSuccess } from '../../utils/response';

export const campusesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await campusesService.getAll(req.query);
      sendSuccess(res, 'Campuses fetched', result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const campus = await campusesService.getById(req.params.id as string);
      sendSuccess(res, 'Campus fetched', campus);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const campus = await campusesService.create(req.body);
      sendSuccess(res, 'Campus created', campus, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const campus = await campusesService.update(req.params.id as string, req.body);
      sendSuccess(res, 'Campus updated', campus);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await campusesService.delete(req.params.id as string);
      sendSuccess(res, 'Campus deleted', null);
    } catch (error) {
      next(error);
    }
  },
};
