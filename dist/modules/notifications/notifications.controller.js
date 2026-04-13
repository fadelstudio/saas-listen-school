"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = void 0;
const notifications_service_1 = require("./notifications.service");
exports.notificationsController = {
    async getMyNotifications(req, res, next) {
        try {
            const userId = req.user.userId;
            const notifications = await notifications_service_1.notificationService.getAllForUser(userId);
            res.sendSuccess('Notifications récupérées', notifications);
        }
        catch (error) {
            next(error);
        }
    },
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            await notifications_service_1.notificationService.markAsRead(id);
            res.sendSuccess('Notification marquée comme lue', null);
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=notifications.controller.js.map