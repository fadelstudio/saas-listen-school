import { Request, Response, NextFunction } from 'express';
import { classesService } from './classes.service';

export const classesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await classesService.getAll(req.query);
      res.sendSuccess('Classes fetched', result.items, 200, {
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
      const cl = await classesService.getById(req.params.id as string);
      res.sendSuccess('Class fetched', cl);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cl = await classesService.create(req.body);
      res.sendSuccess('Class created', cl, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const cl = await classesService.update(req.params.id as string, req.body);
      res.sendSuccess('Class updated', cl);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await classesService.delete(req.params.id as string);
      res.sendSuccess('Class deleted', null);
    } catch (error) {
      next(error);
    }
  },

  async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await classesService.getStudents(req.params.id as string);
      res.sendSuccess('Students for class fetched', students);
    } catch (error) {
      next(error);
    }
  },
};
