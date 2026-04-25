"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = void 0;
const notifications_service_1 = require("./notifications.service");
const pagination_1 = require("../../utils/pagination");
exports.notificationsController = {
    async getMyNotifications(req, res, next) {
        try {
            const userId = req.user.userId;
            const schoolId = req.user.schoolId;
            const userRole = req.user.role;
            const campusIds = req.user.campusIds || [];
            const classId = req.user.classId || null;
            const pagination = (0, pagination_1.parsePagination)(req.query);
            const isRead = typeof req.query.isRead === 'string'
                ? req.query.isRead === 'true'
                : undefined;
            const type = typeof req.query.type === 'string' ? req.query.type : undefined;
            const { items, total } = await notifications_service_1.notificationService.getAllForUser(userId, schoolId, userRole, campusIds, classId, {
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
    async sendBroadcast(req, res, next) {
        try {
            const schoolId = req.user.schoolId;
            // req.body est déjà validé par le middleware validate(schema.sendBroadcast)
            const notification = await notifications_service_1.notificationService.sendBroadcast(schoolId, req.body);
            res.sendSuccess('Broadcast envoyé avec succès', notification, 201);
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
    },
    async deleteNotification(req, res, next) {
        try {
            const schoolId = req.user.schoolId;
            const { id } = req.params;
            await notifications_service_1.notificationService.delete(id, schoolId);
            res.sendSuccess('Notification supprimée', null);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=notifications.controller.js.map