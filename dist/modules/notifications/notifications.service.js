"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const notifications_repository_1 = require("./notifications.repository");
const AppError_1 = require("../../core/errors/AppError");
exports.notificationService = {
    /**
     * Crée une notification individuelle ou globale simple.
     */
    async create(data) {
        return notifications_repository_1.notificationsRepository.create({
            title: data.title,
            message: data.message,
            type: data.type,
            userId: data.userId ?? null,
            targetRoles: data.targetRoles,
            targetCampusIds: data.targetCampusIds,
            targetClassIds: data.targetClassIds,
            targetUserIds: data.targetUserIds,
            campaignId: data.campaignId ?? null,
            schoolId: data.schoolId ?? null,
            url: data.url ?? null,
        });
    },
    /**
     * Envoie une notification ciblée (Broadcast).
     * Supporte maintenant les ciblages multiples via tableaux.
     */
    async sendBroadcast(schoolId, data) {
        // Note: On pourrait ajouter ici une validation métier supplémentaire si besoin
        // Par exemple : si targetClassIds est fourni, vérifier qu'un seul campus est sélectionné?
        // Le user a dit : "si on seletion un seul campuse, on doit avoir le chois entre les classe de se campus"
        // Dans le backend, on accepte simplement les tableaux fournis par le front.
        return notifications_repository_1.notificationsRepository.create({
            schoolId,
            title: data.title,
            message: data.message,
            type: 'BROADCAST',
            targetRoles: data.targetRoles,
            targetCampusIds: data.targetCampusIds,
            targetClassIds: data.targetClassIds,
            targetUserIds: data.targetUserIds,
            url: data.url,
            attachments: data.attachments,
        });
    },
    /**
     * Récupère les notifications pour un utilisateur donné, incluant les ciblages.
     */
    async getAllForUser(userId, schoolId, userRole, campusIds, classId, opts) {
        const filters = {
            isRead: opts.isRead,
            type: opts.type,
        };
        return notifications_repository_1.notificationsRepository.findAllForUser(userId, schoolId, userRole, campusIds, classId, filters, { skip: opts.skip, limit: opts.limit });
    },
    async markAsReadForUser(userId, id) {
        const updated = await notifications_repository_1.notificationsRepository.markAsRead(id, userId);
        if (updated.count === 0) {
            throw new AppError_1.NotFoundError('Notification non trouvée ou déjà lue');
        }
    },
    async delete(id, schoolId) {
        const notif = await notifications_repository_1.notificationsRepository.findById(id);
        if (!notif || notif.schoolId !== schoolId) {
            throw new AppError_1.NotFoundError('Notification');
        }
        return notifications_repository_1.notificationsRepository.delete(id);
    }
};
//# sourceMappingURL=notifications.service.js.map