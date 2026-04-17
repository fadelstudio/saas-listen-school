import { Request, Response, NextFunction } from 'express';
import { decisionsService } from './decisions.service';
import { DecisionStatus } from '@prisma/client';

export const decisionsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await decisionsService.create(
        req.body,
        req.user!.userId,
        req.user!.role,
        req.user?.schoolId || null
      );
      res.sendSuccess('Decision created', result, 201);
    } catch (error) { next(error); }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await decisionsService.getAll(req.query as Record<string, unknown>, req.user?.schoolId || null);
      res.sendSuccess('Decisions fetched', result);
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await decisionsService.getById(req.params.id as string, req.user?.schoolId || null);
      res.sendSuccess('Decision fetched', result);
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await decisionsService.update(
        req.params.id as string,
        req.body,
        req.user!.role,
        req.user?.schoolId || null
      );
      res.sendSuccess('Decision updated', result);
    } catch (error) { next(error); }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await decisionsService.updateStatus(
        req.params.id as string, req.body.status as DecisionStatus, req.user!.role, req.user?.schoolId || null
      );
      res.sendSuccess('Decision status updated', result);
    } catch (error) { next(error); }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await decisionsService.delete(req.params.id as string, req.user!.role, req.user?.schoolId || null);
      res.sendSuccess('Decision deleted', null);
    } catch (error) { next(error); }
  },
};
