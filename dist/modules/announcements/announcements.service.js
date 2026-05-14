"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementsService = void 0;
const announcements_repository_1 = require("./announcements.repository");
const AppError_1 = require("../../core/errors/AppError");
const notifications_service_1 = require("../notifications/notifications.service");
exports.announcementsService = {
    async create(schoolId, data, userRole) {
        if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only admins can create announcements');
        }
        if (data.isActive) {
            await announcements_repository_1.announcementsRepository.deactivateAll(schoolId);
        }
        const announcement = await announcements_repository_1.announcementsRepository.create(schoolId, data);
        if (announcement.isActive) {
            await this.notifyActivation(schoolId, announcement);
        }
        return announcement;
    },
    async getAll(schoolId) {
        return announcements_repository_1.announcementsRepository.findAll(schoolId);
    },
    async getActive(schoolId) {
        return announcements_repository_1.announcementsRepository.findActive(schoolId);
    },
    async update(id, schoolId, data, userRole) {
        if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only admins can update announcements');
        }
        const existing = await announcements_repository_1.announcementsRepository.findById(id, schoolId);
        if (!existing)
            throw new AppError_1.NotFoundError('Announcement');
        if (data.isActive && !existing.isActive) {
            await announcements_repository_1.announcementsRepository.deactivateAll(schoolId);
        }
        await announcements_repository_1.announcementsRepository.update(id, schoolId, data);
        const updated = await announcements_repository_1.announcementsRepository.findById(id, schoolId);
        if (data.isActive && !existing.isActive && updated) {
            await this.notifyActivation(schoolId, updated);
        }
        return updated;
    },
    async delete(id, schoolId, userRole) {
        if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only admins can delete announcements');
        }
        return announcements_repository_1.announcementsRepository.delete(id, schoolId);
    },
    async notifyActivation(schoolId, announcement) {
        try {
            await notifications_service_1.notificationService.sendBroadcast(schoolId, {
                title: `📢 Nouvelle annonce : ${announcement.title}`,
                message: announcement.description || 'Une nouvelle annonce est disponible.',
                type: 'ANNOUNCEMENT',
                url: announcement.imageUrl ? announcement.imageUrl : undefined,
            });
        }
        catch (error) {
            console.warn('[AnnouncementsService] Failed to send activation notification', error);
        }
    }
};
//# sourceMappingURL=announcements.service.js.map