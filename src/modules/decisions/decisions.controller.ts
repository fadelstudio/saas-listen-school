import { Request, Response, NextFunction } from 'express';
import { decisionsService } from './decisions.service';
import { sendSuccess } from '../../utils/response';
import { DecisionStatus } from '@prisma/client';

export const decisionsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await decisionsService.create(req.body, req.user!.userId, req.user!.role);
      sendSuccess(res, 'Decision created', result, 201);
    } catch (error) { next(error); }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await decisionsService.getAll(req.query as Record<string, unknown>);
      sendSuccess(res, 'Decisions fetched', result);
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await decisionsService.getById(req.params.id as string);
      sendSuccess(res, 'Decision fetched', result);
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await decisionsService.update(req.params.id as string, req.body, req.user!.role);
      sendSuccess(res, 'Decision updated', result);
    } catch (error) { next(error); }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await decisionsService.updateStatus(
        req.params.id as string, req.body.status as DecisionStatus, req.user!.role
      );
      sendSuccess(res, 'Decision status updated', result);
    } catch (error) { next(error); }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await decisionsService.delete(req.params.id as string, req.user!.role);
      sendSuccess(res, 'Decision deleted', null);
    } catch (error) { next(error); }
  },
};
