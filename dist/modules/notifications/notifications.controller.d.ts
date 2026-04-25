import { Request, Response, NextFunction } from 'express';
export declare const notificationsController: {
    getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    sendBroadcast(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=notifications.controller.d.ts.map