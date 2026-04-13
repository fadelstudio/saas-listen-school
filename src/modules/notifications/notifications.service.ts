import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';

export type NotificationType =
  | 'AI_FAILURE'
  | 'EVALUATION_CAMPAIGN'
  | 'EVALUATION_CAMPAIGN_REMINDER'
  | 'SYSTEM';

export const notificationService = {
  async create(data: {
    title: string;
    message: string;
    type: NotificationType;
    userId?: string;
    campaignId?: string;
  }) {
    return prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        userId: data.userId ?? null,
        campaignId: data.campaignId ?? null,
      },
    });
  },

  async getAllForUser(
    userId: string,
    opts?: {
      isRead?: boolean;
      type?: NotificationType;
      skip?: number;
      limit?: number;
    }
  ) {
    const where = {
      OR: [{ userId }, { userId: null as string | null }],
      ...(typeof opts?.isRead === 'boolean' ? { isRead: opts.isRead } : {}),
      ...(opts?.type ? { type: opts.type } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: opts?.skip,
        take: opts?.limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { items, total };
  },

  async markAsReadForUser(userId: string, id: string) {
    const updated = await prisma.notification.updateMany({
      where: {
        id,
        OR: [{ userId }, { userId: null }],
      },
      data: { isRead: true },
    });

    if (updated.count === 0) {
      throw new NotFoundError('Notification');
    }
  },
};
