"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = void 0;
const notifications_service_1 = require("./notifications.service");
const pagination_1 = require("../../utils/pagination");
exports.notificationsController = {
    async getMyNotifications(req, res, next) {
        try {
            const userId = req.user.userId;
            const pagination = (0, pagination_1.parsePagination)(req.query);
            const isRead = typeof req.query.isRead === 'string'
                ? req.query.isRead === 'true'
                : undefined;
            const type = typeof req.query.type === 'string' ? req.query.type : undefined;
            const { items, total } = await notifications_service_1.notificationService.getAllForUser(userId, {
                isRead,
                type,
                skip: pagination.skip,
                limit: pagination.limit,
            });
            const meta = (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
            res.sendSuccess('Notifications récupérées', items, 200, meta);
        }
        catch (error) {
            next(error);
        }
    },
    async markAsRead(req, res, next) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            await notifications_service_1.notificationService.markAsReadForUser(userId, id);
            res.sendSuccess('Notification marquée comme lue', null);
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=notifications.controller.js.map