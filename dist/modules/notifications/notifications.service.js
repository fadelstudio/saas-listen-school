"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.notificationService = {
    async create(data) {
        return prisma_1.prisma.notification.create({
            data: {
                title: data.title,
                message: data.message,
                type: data.type,
                userId: data.userId ?? null,
            },
        });
    },
    async getAllForUser(userId) {
        return prisma_1.prisma.notification.findMany({
            where: {
                OR: [
                    { userId },
                    { userId: null }, // Global notifications
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    async markAsRead(id) {
        return prisma_1.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    },
};
//# sourceMappingURL=notifications.service.js.map