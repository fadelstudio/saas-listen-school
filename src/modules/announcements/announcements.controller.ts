import { Request, Response, NextFunction } from 'express';
import { announcementsService } from './announcements.service';
import { BadRequestError } from '../../core/errors/AppError';

export const announcementsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const announcement = await announcementsService.create(req.schoolId, req.body, req.user!.role);
      res.sendSuccess('Announcement created successfully', announcement, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const announcements = await announcementsService.getAll(req.schoolId);
      res.sendSuccess('Announcements fetched', announcements);
    } catch (error) {
      next(error);
    }
  },

  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const announcement = await announcementsService.getActive(req.schoolId);
      res.sendSuccess('Active announcement fetched', announcement);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const announcement = await announcementsService.update(req.params.id as string, req.schoolId, req.body, req.user!.role);
      res.sendSuccess('Announcement updated', announcement);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      await announcementsService.delete(req.params.id as string, req.schoolId, req.user!.role);
      res.sendSuccess('Announcement deleted', null);
    } catch (error) {
      next(error);
    }
  },
};
