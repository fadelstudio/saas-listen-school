import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { professorsService } from './professors.service';
import { BadRequestError } from '../../core/errors/AppError';

export const professorsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await professorsService.getAll(req.schoolId, req.query, req.user?.role, req.user?.campusIds);
      res.sendSuccess('Professors fetched', result.items, 200, {
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
      const professor = await professorsService.getById(req.params.id as string, req.schoolId, req.user?.role, req.user?.campusIds);
      res.sendSuccess('Professor fetched', professor);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const professor = await professorsService.create(
        req.schoolId, 
        req.body, 
        req.user?.role,
        req.user?.campusIds,
        req.user?.userId
      );
      res.sendSuccess('Professor created', professor, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const professor = await professorsService.update(
        req.params.id as string, 
        req.schoolId, 
        req.body, 
        req.user?.role,
        req.user?.campusIds,
        req.user?.userId
      );
      res.sendSuccess('Professor updated', professor);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      await professorsService.delete(
        req.params.id as string, 
        req.schoolId, 
        req.user?.role,
        req.user?.campusIds,
        req.user?.userId
      );
      res.sendSuccess('Professor deleted', null);
    } catch (error) {
      next(error);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      if (!req.file) {
        throw new BadRequestError('file is required (multipart field: file)');
      }
      const professor = await professorsService.uploadAvatar(
        req.schoolId,
        req.params.id as string,
        req.file,
        { userId: req.user!.userId, role: req.user!.role as Role },
      );
      res.sendSuccess('Professor photo updated', professor);
    } catch (error) {
      next(error);
    }
  },

  async clearAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const professor = await professorsService.clearAvatar(req.schoolId, req.params.id as string, {
        userId: req.user!.userId,
        role: req.user!.role as Role,
      });
      res.sendSuccess('Professor photo removed', professor);
    } catch (error) {
      next(error);
    }
  },
};
