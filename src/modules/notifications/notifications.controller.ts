import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notifications.service';
import { buildPaginated, parsePagination } from '../../utils/pagination';
import { Role } from '@prisma/client';

export const notificationsController = {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId    = req.user!.userId;
      const schoolId  = req.user!.schoolId!;
      const userRole  = req.user!.role;
      const campusIds = req.user!.campusIds || [];
      const classId   = req.user!.classId || null;

      const pagination = parsePagination(req.query as Record<string, unknown>);
      const isRead =
        typeof req.query.isRead === 'string'
          ? req.query.isRead === 'true'
          : undefined;
      const type =
        typeof req.query.type === 'string' ? (req.query.type as any) : undefined;

      const { items, total } = await notificationService.getAllForUser(
        userId, 
        schoolId, 
        userRole as Role,
        campusIds,
        classId,
        {
          isRead,
          type,
          skip:  pagination.skip,
          limit: pagination.limit,
        }
      );

      const meta = buildPaginated(items, total, pagination.page, pagination.limit);
      res.sendSuccess('Notifications récupérées', items, 200, meta);
    } catch (error) {
      next(error);
    }
  },

  async sendBroadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId!;
      // req.body est déjà validé par le middleware validate(schema.sendBroadcast)
      const notification = await notificationService.sendBroadcast(schoolId, req.body);

      res.sendSuccess('Broadcast envoyé avec succès', notification, 201);
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      await notificationService.markAsReadForUser(userId, id as string);
      res.sendSuccess('Notification marquée comme lue', null);
    } catch (error) {
      next(error);
    }
  },

  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId!;
      const { id } = req.params;
      await notificationService.delete(id as string, schoolId);
      res.sendSuccess('Notification supprimée', null);
    } catch (error) {
      next(error);
    }
  },

  async updateFcmToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { fcmToken, uti } = req.body;
      if (!fcmToken || typeof fcmToken !== 'string') {
        res.status(400).json({ success: false, message: 'fcmToken requis' });
        return;
      }
      await notificationService.updateFcmToken(userId, fcmToken, uti);
      res.sendSuccess('Token FCM mis à jour', null);
    } catch (error) {
      next(error);
    }
  },

  async getGuestNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const uti = req.query.uti as string;
      if (!uti) {
        res.status(400).json({ success: false, message: 'uti requis' });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const { items, total } = await notificationService.getAllForGuest(uti, { skip, limit });
      res.sendSuccess('Notifications invité récupérées', items, 200, {
        page, limit, total, totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      next(error);
    }
  },
};
