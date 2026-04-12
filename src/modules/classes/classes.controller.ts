import { Request, Response, NextFunction } from 'express';
import { classesService } from './classes.service';
import { sendSuccess } from '../../utils/response';

export const classesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await classesService.getAll(req.query);
      sendSuccess(res, 'Classes fetched', result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const cl = await classesService.getById(req.params.id as string);
      sendSuccess(res, 'Class fetched', cl);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cl = await classesService.create(req.body);
      sendSuccess(res, 'Class created', cl, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const cl = await classesService.update(req.params.id as string, req.body);
      sendSuccess(res, 'Class updated', cl);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await classesService.delete(req.params.id as string);
      sendSuccess(res, 'Class deleted', null);
    } catch (error) {
      next(error);
    }
  },
};
