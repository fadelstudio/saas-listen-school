import { Request, Response, NextFunction } from 'express';
import { classesService } from './classes.service';
import { BadRequestError } from '../../core/errors/AppError';

export const classesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await classesService.getAll(
        req.schoolId,
        req.query,
        req.user?.role,
        req.user?.campusIds,
        req.user?.classId
      );
      res.sendSuccess('Classes fetched', result.items, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const cl = await classesService.getById(req.params.id as string, req.schoolId, req.user?.role, req.user?.campusIds);
      res.sendSuccess('Class fetched', cl);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const cl = await classesService.create(
        req.schoolId, 
        req.body, 
        req.user?.role, 
        req.user?.campusIds, 
        req.user?.userId
      );
      res.sendSuccess('Class created', cl, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const cl = await classesService.update(
        req.params.id as string, 
        req.schoolId, 
        req.body, 
        req.user?.role, 
        req.user?.campusIds, 
        req.user?.userId
      );
      res.sendSuccess('Class updated', cl);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      await classesService.delete(
        req.params.id as string, 
        req.schoolId, 
        req.user?.role, 
        req.user?.campusIds, 
        req.user?.userId
      );
      res.sendSuccess('Class deleted', null);
    } catch (error) {
      next(error);
    }
  },

  async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const students = await classesService.getStudents(req.params.id as string, req.schoolId, req.user?.role, req.user?.campusIds);
      res.sendSuccess('Students for class fetched', students);
    } catch (error) {
      next(error);
    }
  },
};
