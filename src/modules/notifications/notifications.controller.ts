import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notifications.service';

export const notificationsController = {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notifications = await notificationService.getAllForUser(userId);
      res.sendSuccess('Notifications récupérées', notifications);
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id as string);
      res.sendSuccess('Notification marquée comme lue', null);
    } catch (error) {
      next(error);
    }
  }
};
