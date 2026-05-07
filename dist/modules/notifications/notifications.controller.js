"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = void 0;
const notifications_service_1 = require("./notifications.service");
const pagination_1 = require("../../utils/pagination");
const logger_1 = require("../../utils/logger");
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
    async updateFcmToken(req, res, next) {
        try {
            const { fcmToken, uti } = req.body;
            if (!fcmToken || typeof fcmToken !== 'string') {
                res.status(400).json({ success: false, message: 'fcmToken requis' });
                return;
            }
            if (req.user?.userId) {
                // Authenticated user (optionally merging an UTI)
                await notifications_service_1.notificationService.updateFcmToken(req.user.userId, fcmToken, uti);
                res.sendSuccess('Token FCM utilisateur mis à jour', null);
            }
            else if (uti) {
                // Guest mode (UTI only)
                await notifications_service_1.notificationService.registerGuestFcmToken(uti, fcmToken);
                res.sendSuccess('Token FCM invité mis à jour', null);
            }
            else {
                res.status(400).json({ success: false, message: 'Authentification ou UTI requis' });
            }
        }
        catch (error) {
            logger_1.logger.error('[NotificationController] updateFcmToken failed', {
                error: error.message,
                stack: error.stack,
                body: req.body,
                userId: req.user?.userId
            });
            next(error);
        }
    },
    async updateGuestFcmToken(req, res, next) {
        try {
            const { fcmToken, uti } = req.body;
            if (!fcmToken || !uti) {
                res.status(400).json({ success: false, message: 'fcmToken et uti requis' });
                return;
            }
            await notifications_service_1.notificationService.registerGuestFcmToken(uti, fcmToken);
            res.sendSuccess('Token FCM invité mis à jour', null);
        }
        catch (error) {
            next(error);
        }
    },
    async getGuestNotifications(req, res, next) {
        try {
            const uti = req.query.uti;
            if (!uti) {
                res.status(400).json({ success: false, message: 'uti requis' });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const { items, total } = await notifications_service_1.notificationService.getAllForGuest(uti, { skip, limit });
            res.sendSuccess('Notifications invité récupérées', items, 200, {
                page, limit, total, totalPages: Math.ceil(total / limit)
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getUnreadCount(req, res, next) {
        try {
            const userId = req.user.userId;
            const schoolId = req.user.schoolId;
            const userRole = req.user.role;
            const campusIds = req.user.campusIds || [];
            const classId = req.user.classId || null;
            const count = await notifications_service_1.notificationService.getUnreadCount(userId, schoolId, userRole, campusIds, classId);
            res.sendSuccess('Nombre de notifications non lues récupéré', { count });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=notifications.controller.js.map