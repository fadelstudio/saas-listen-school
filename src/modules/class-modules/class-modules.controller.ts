import { Request, Response, NextFunction } from 'express';
import { classModulesService } from './class-modules.service';
import { BadRequestError } from '../../core/errors/AppError';

export const classModulesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const filters = {
        classId: req.query.classId as string | undefined,
        moduleId: req.query.moduleId as string | undefined,
      };
      const assignments = await classModulesService.getAll(req.schoolId, filters);
      res.sendSuccess('Affectations récupérées', assignments);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const { id } = req.params;
      const assignment = await classModulesService.getById(id as string, req.schoolId);
      res.sendSuccess('Affectation récupérée', assignment);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const assignment = await classModulesService.create(req.schoolId, req.body);
      res.sendSuccess('Affectation créée', assignment, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const { id } = req.params;
      const assignment = await classModulesService.update(id as string, req.schoolId, req.body);
      res.sendSuccess('Affectation mise à jour', assignment);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const { id } = req.params;
      await classModulesService.delete(id as string, req.schoolId);
      res.sendSuccess('Affectation supprimée', null);
    } catch (err) {
      next(err);
    }
  },
};
