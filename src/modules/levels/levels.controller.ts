import { Request, Response, NextFunction } from 'express';
import { levelsService } from './levels.service';
import { BadRequestError } from '../../core/errors/AppError';

export const levelsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await levelsService.getAll(req.schoolId, req.query);
      res.sendSuccess('Liste des niveaux récupérée', result.items, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const level = await levelsService.getById(req.params.id as string, req.schoolId);
      res.sendSuccess('Niveau récupéré', level);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const level = await levelsService.create(req.schoolId, req.body);
      res.sendSuccess('Niveau créé', level, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const level = await levelsService.update(req.params.id as string, req.schoolId, req.body);
      res.sendSuccess('Niveau mis à jour', level);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      await levelsService.delete(req.params.id as string, req.schoolId);
      res.sendSuccess('Niveau supprimé', null);
    } catch (err) {
      next(err);
    }
  },
};
