import { Request, Response, NextFunction } from 'express';
import { levelsService } from './levels.service';

export const levelsController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const levels = await levelsService.getAll();
      res.json({ success: true, message: 'Liste des niveaux récupérée', data: levels });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const level = await levelsService.getById(req.params.id as string);
      res.json({ success: true, message: 'Niveau récupéré', data: level });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const level = await levelsService.create(req.body);
      res.status(201).json({ success: true, message: 'Niveau créé', data: level });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const level = await levelsService.update(req.params.id as string, req.body);
      res.json({ success: true, message: 'Niveau mis à jour', data: level });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await levelsService.delete(req.params.id as string);
      res.json({ success: true, message: 'Niveau supprimé', data: null });
    } catch (err) {
      next(err);
    }
  },
};
