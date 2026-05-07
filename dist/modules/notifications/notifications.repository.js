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
                targetDeviceUti: data.targetDeviceUti,
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
                    targetDeviceUti: null,
                    AND: [
                        {
                            OR: [
                                { targetRoles: { isEmpty: true } },
                                { targetRoles: { has: userRole } }
                            ]
                        },
                        {
                            OR: [
                                { targetCampusIds: { isEmpty: true } },
                                { targetCampusIds: { hasSome: campusIds } }
                            ]
                        },
                        {
                            OR: [
                                { targetClassIds: { isEmpty: true } },
                                { targetClassIds: classId ? { has: classId } : undefined }
                            ].filter(Boolean)
                        },
                    ],
                },
                // Notifications système globales (SaaS SuperAdmin)
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
    async countUnread(userId, schoolId, userRole, campusIds, classId) {
        const where = {
            schoolId,
            isRead: false,
            OR: [
                { userId },
                { targetUserIds: { has: userId } },
                {
                    userId: null,
                    targetDeviceUti: null,
                    AND: [
                        {
                            OR: [
                                { targetRoles: { isEmpty: true } },
                                { targetRoles: { has: userRole } }
                            ]
                        },
                        {
                            OR: [
                                { targetCampusIds: { isEmpty: true } },
                                { targetCampusIds: { hasSome: campusIds } }
                            ]
                        },
                        {
                            OR: [
                                { targetClassIds: { isEmpty: true } },
                                { targetClassIds: classId ? { has: classId } : undefined }
                            ].filter(Boolean)
                        },
                    ],
                },
                { userId: null, schoolId: null },
            ],
        };
        return prisma_1.prisma.notification.count({ where });
    },
    /**
     * Récupère les notifications pour un invité identifié par son UTI.
     */
    async findAllForGuest(uti, pagination) {
        const where = {
            targetDeviceUti: uti,
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: pagination.skip ?? 0,
                take: pagination.limit ?? 20,
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
                    { userId: null, targetUserIds: { isEmpty: true } }
                ],
            },
            data: { isRead: true },
        });
    },
    async markAsReadForGuest(id, uti) {
        return prisma_1.prisma.notification.updateMany({
            where: { id, targetDeviceUti: uti },
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