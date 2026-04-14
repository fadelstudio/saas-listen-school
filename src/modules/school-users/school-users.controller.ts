import { Request, Response, NextFunction } from 'express';
import { schoolUsersService } from './school-users.service';

export const schoolUsersController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schoolUsersService.create(req.user!.userId, req.body);
      res.sendSuccess('User created', result, 201);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schoolUsersService.list(req.user!.userId, req.query as Record<string, unknown>);
      res.sendSuccess('Users retrieved', result.items, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schoolUsersService.update(req.user!.userId, req.params.id as string, req.body);
      res.sendSuccess('User updated', result);
    } catch (e) {
      next(e);
    }
  },
};
