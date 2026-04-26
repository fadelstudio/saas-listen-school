import { prisma } from '../../core/database/prisma';
import { Prisma, Role } from '@prisma/client';
import { NotificationType, NotificationFilters } from './notifications.types';

export const notificationsRepository = {
  async create(data: {
    title: string;
    message: string;
    type: NotificationType;
    userId?: string | null;
    campaignId?: string | null;
    schoolId?: string | null;
    targetRoles?: Role[];
    targetCampusIds?: string[];
    targetClassIds?: string[];
    targetUserIds?: string[];
    targetDeviceUti?: string | null;
    url?: string | null;
    attachments?: any;
  }) {
    return prisma.notification.create({
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

  async findAllForUser(
    userId: string,
    schoolId: string,
    userRole: Role,
    campusIds: string[],
    classId: string | null,
    filters: NotificationFilters,
    pagination: { skip?: number; limit?: number }
  ) {
    const where: Prisma.NotificationWhereInput = {
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
              ].filter(Boolean) as Prisma.NotificationWhereInput[]
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
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Récupère les notifications pour un invité identifié par son UTI.
   */
  async findAllForGuest(
    uti: string,
    pagination: { skip?: number; limit?: number }
  ) {
    const where: Prisma.NotificationWhereInput = {
      targetDeviceUti: uti,
    };

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip ?? 0,
        take: pagination.limit ?? 20,
      }),
      prisma.notification.count({ where }),
    ]);

    return { items, total };
  },

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
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

  async markAsReadForGuest(id: string, uti: string) {
    return prisma.notification.updateMany({
      where: { id, targetDeviceUti: uti },
      data: { isRead: true },
    });
  },

  async findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  async delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  },
};
