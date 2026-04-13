"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const prisma_1 = require("../../core/database/prisma");
const AppError_1 = require("../../core/errors/AppError");
exports.notificationService = {
    async create(data) {
        return prisma_1.prisma.notification.create({
            data: {
                title: data.title,
                message: data.message,
                type: data.type,
                userId: data.userId ?? null,
                campaignId: data.campaignId ?? null,
            },
        });
    },
    async getAllForUser(userId, opts) {
        const where = {
            OR: [{ userId }, { userId: null }],
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