import { Request, Response, NextFunction } from 'express';
import { notificationService, type NotificationType } from './notifications.service';
import { buildPaginated, parsePagination } from '../../utils/pagination';

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
        typeof req.query.type === 'string' ? (req.query.type as NotificationType) : undefined;

      const { items, total } = await notificationService.getAllForUser(
        userId, 
        schoolId, 
        userRole,
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
      const { title, message, targetRole, targetCampusId, targetClassId, url, attachments } = req.body;

      const notification = await notificationService.sendBroadcast({
        schoolId,
        title,
        message,
        targetRole,
        targetCampusId,
        targetClassId,
        url,
        attachments,
      });

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
};
