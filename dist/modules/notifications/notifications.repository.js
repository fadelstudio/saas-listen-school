"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.notificationsRepository = {
    async create(data) {
        return prisma_1.prisma.notification.create({
            data: {
                title: data.title,
                message: data.message,
                type: data.type,
                userId: data.userId,
                campaignId: data.campaignId,
                schoolId: data.schoolId,
                targetRoles: data.targetRoles ?? [],
                targetCampusIds: data.targetCampusIds ?? [],
                targetClassIds: data.targetClassIds ?? [],
                targetUserIds: data.targetUserIds ?? [],
                url: data.url,
                attachments: data.attachments,
            },
        });
    },
    async findAllForUser(userId, schoolId, userRole, campusIds, classId, filters, pagination) {
        const where = {
            schoolId,
            OR: [
                // Adressée directement
                { userId },
                // Ciblage spécifique par User ID
                { targetUserIds: { has: userId } },
                // Broadcast ciblé
                {
                    userId: null,
                    AND: [
                        // Filtre par Rôle
                        {
                            OR: [
                                { targetRoles: { isEmpty: true } },
                                { targetRoles: { has: userRole } }
                            ]
                        },
                        // Filtre par Campus
                        {
                            OR: [
                                { targetCampusIds: { isEmpty: true } },
                                { targetCampusIds: { hasSome: campusIds } }
                            ]
                        },
                        // Filtre par Classe
                        {
                            OR: [
                                { targetClassIds: { isEmpty: true } },
                                { targetClassIds: classId ? { has: classId } : undefined }
                            ].filter(Boolean)
                        },
                    ],
                },
                // Notifications système globales (SaaS)
                { userId: null, schoolId: null },
            ],
            ...(typeof filters.isRead === 'boolean' ? { isRead: filters.isRead } : {}),
            ...(filters.type ? { type: filters.type } : {}),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: pagination.skip,
                take: pagination.limit,
            }),
            prisma_1.prisma.notification.count({ where }),
        ]);
        return { items, total };
    },
    async markAsRead(id, userId) {
        return prisma_1.prisma.notification.updateMany({
            where: {
                id,
                OR: [
                    { userId },
                    { userId: null, targetUserIds: { has: userId } },
                    { userId: null, targetUserIds: { isEmpty: true } } // Broadcasts
                ],
            },
            data: { isRead: true },
        });
    },
    async findById(id) {
        return prisma_1.prisma.notification.findUnique({ where: { id } });
    },
    async delete(id) {
        return prisma_1.prisma.notification.delete({ where: { id } });
    },
};
//# sourceMappingURL=notifications.repository.js.map