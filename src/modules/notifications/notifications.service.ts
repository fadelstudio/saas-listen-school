import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';

export type NotificationType =
  | 'AI_FAILURE'
  | 'EVALUATION_CAMPAIGN'
  | 'EVALUATION_CAMPAIGN_REMINDER'
  | 'SYSTEM'
  | 'BROADCAST';

export const notificationService = {
  /**
   * Crée une notification individuelle ou globale simple.
   */
  async create(data: {
    title: string;
    message: string;
    type: NotificationType;
    userId?: string;
    campaignId?: string;
    schoolId?: string;
  }) {
    return prisma.notification.create({
      data: {
        title:      data.title,
        message:    data.message,
        type:       data.type,
        userId:     data.userId     ?? null,
        campaignId: data.campaignId ?? null,
        schoolId:   data.schoolId   ?? null,
      },
    });
  },

  /**
   * Envoie une notification ciblée (Broadcast).
   */
  async sendBroadcast(data: {
    schoolId: string;
    title: string;
    message: string;
    targetRole?: any;
    targetCampusId?: string;
    targetClassId?: string;
    url?: string;
    attachments?: any;
  }) {
    return prisma.notification.create({
      data: {
        schoolId:       data.schoolId,
        title:          data.title,
        message:        data.message,
        type:           'BROADCAST',
        targetRole:     data.targetRole     ?? null,
        targetCampusId: data.targetCampusId ?? null,
        targetClassId:  data.targetClassId  ?? null,
        url:            data.url            ?? null,
        attachments:    data.attachments    ?? null,
      },
    });
  },

  /**
   * Récupère les notifications pour un utilisateur donné, incluant les ciblages.
   */
  async getAllForUser(
    userId: string,
    schoolId: string,
    userRole: any,
    campusIds: string[],
    classId: string | null,
    opts?: {
      isRead?: boolean;
      type?: NotificationType;
      skip?: number;
      limit?: number;
    }
  ) {
    const where: any = {
      schoolId,
      OR: [
        // Adressée directement
        { userId },
        // Broadcast ciblé
        {
          userId: null,
          AND: [
            // Filtre par Rôle
            { OR: [{ targetRole: null }, { targetRole: userRole }] },
            // Filtre par Campus (l'utilisateur peut avoir plusieurs campusIds)
            { OR: [{ targetCampusId: null }, { targetCampusId: { in: campusIds } }] },
            // Filtre par Classe
            { OR: [{ targetClassId: null }, { targetClassId: classId }] },
          ],
        },
        // Notifications système globales (SaaS)
        { userId: null, schoolId: null },
      ],
      ...(typeof opts?.isRead === 'boolean' ? { isRead: opts.isRead } : {}),
      ...(opts?.type ? { type: opts.type } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    opts?.skip,
        take:    opts?.limit,
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

  async delete(id: string, schoolId: string) {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.schoolId !== schoolId) {
      throw new NotFoundError('Notification');
    }
    return prisma.notification.delete({ where: { id } });
  }
};
