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

  async listStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schoolUsersService.listStaff(req.user!.userId, req.query as Record<string, unknown>);
      res.sendSuccess('Staff retrieved', result.items, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (e) {
      next(e);
    }
  },

  async listStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schoolUsersService.listStudents(req.user!.userId, req.query as Record<string, unknown>);
      res.sendSuccess('Students retrieved', result.items, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schoolUsersService.getById(req.user!.userId, req.params.id as string);
      res.sendSuccess('User retrieved', result);
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

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await schoolUsersService.delete(req.user!.userId, req.params.id as string);
      res.sendSuccess('User deleted successfully', null);
    } catch (e) {
      next(e);
    }
  },

  async resetPasswordToDefault(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schoolUsersService.resetPasswordToDefault(
        req.user!.userId,
        req.params.id as string
      );
      res.sendSuccess('Password reset', result);
    } catch (e) {
      next(e);
    }
  },
};
