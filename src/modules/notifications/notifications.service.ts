import { prisma } from '../../core/database/prisma';

export const notificationService = {
  async create(data: {
    title: string;
    message: string;
    type: 'AI_FAILURE' | 'EVALUATION_CAMPAIGN' | 'SYSTEM';
    userId?: string;
  }) {
    return prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        userId: data.userId ?? null,
      },
    });
  },

  async getAllForUser(userId: string) {
    return prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          { userId: null }, // Global notifications
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },
};
