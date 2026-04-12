import { Request, Response, NextFunction } from 'express';
import { classModulesService } from './class-modules.service';
import { sendSuccess } from '../../utils/response';

export const classModulesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        classId: req.query.classId as string,
        moduleId: req.query.moduleId as string,
      };
      const assignments = await classModulesService.getAll(filters);
      sendSuccess(res, 'Affectations récupérées', assignments);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const assignment = await classModulesService.getById(id as string);
      sendSuccess(res, 'Affectation récupérée', assignment);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await classModulesService.create(req.body);
      sendSuccess(res, 'Affectation créée', assignment, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const assignment = await classModulesService.update(id as string, req.body);
      sendSuccess(res, 'Affectation mise à jour', assignment);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await classModulesService.delete(id as string);
      sendSuccess(res, 'Affectation supprimée', null);
    } catch (err) {
      next(err);
    }
  },
};
