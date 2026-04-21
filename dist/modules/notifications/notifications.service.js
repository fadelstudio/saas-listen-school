"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const prisma_1 = require("../../core/database/prisma");
const AppError_1 = require("../../core/errors/AppError");
exports.notificationService = {
    /**
     * Crée une notification.
     * - userId : null = notification globale (visible par tous les utilisateurs de l'école)
     * - schoolId : permet d'isoler les notifications globales par école
     */
    async create(data) {
        return prisma_1.prisma.notification.create({
            data: {
                title: data.title,
                message: data.message,
                type: data.type,
                userId: data.userId ?? null,
                campaignId: data.campaignId ?? null,
                // schoolId stocké si disponible pour isoler les notifications globales
                // Si le champ n'existe pas encore en DB, cette ligne sera ignorée gracieusement
                ...(data.schoolId ? { schoolId: data.schoolId } : {}),
            },
        });
    },
    /**
     * Récupère les notifications pour un utilisateur donné, isolées par école.
     * Retourne :
     *  - Les notifications adressées directement à l'utilisateur (userId = userId)
     *  - Les notifications globales de l'école (userId = null AND schoolId = schoolId)
     *  - Les notifications globales système pures (userId = null AND schoolId = null)
     */
    async getAllForUser(userId, schoolId, opts) {
        const where = {
            OR: [
                // Notifications personnelles
                { userId },
                // Notifications globales de cette école
                { userId: null, schoolId },
                // Notifications globales système (SuperAdmin broadcast)
                { userId: null, schoolId: null },
            ],
            ...(typeof opts?.isRead === 'boolean' ? { isRead: opts.isRead } : {}),
            ...(opts?.type ? { type: opts.type } : {}),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: opts?.skip,
                take: opts?.limit,
            }),
            prisma_1.prisma.notification.count({ where }),
        ]);
        return { items, total };
    },
    async markAsReadForUser(userId, id) {
        const updated = await prisma_1.prisma.notification.updateMany({
            where: {
                id,
                OR: [{ userId }, { userId: null }],
            },
            data: { isRead: true },
        });
        if (updated.count === 0) {
            throw new AppError_1.NotFoundError('Notification');
        }
    },
};
//# sourceMappingURL=notifications.service.js.map