import { notificationsRepository } from './notifications.repository';
import { NotFoundError } from '../../core/errors/AppError';
import { NotificationType, SendBroadcastInput, NotificationFilters } from './notifications.types';
import { Role } from '@prisma/client';

export const notificationService = {
  /**
   * Crée une notification individuelle ou globale simple.
   */
  async create(data: {
    title: string;
    message: string;
    type: NotificationType;
    userId?: string | null;
    targetRoles?: Role[];
    targetCampusIds?: string[];
    targetClassIds?: string[];
    targetUserIds?: string[];
    campaignId?: string | null;
    schoolId?: string | null;
    url?: string | null;
  }) {
    return notificationsRepository.create({
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
  async sendBroadcast(schoolId: string, data: SendBroadcastInput) {
    // Note: On pourrait ajouter ici une validation métier supplémentaire si besoin
    // Par exemple : si targetClassIds est fourni, vérifier qu'un seul campus est sélectionné?
    // Le user a dit : "si on seletion un seul campuse, on doit avoir le chois entre les classe de se campus"
    // Dans le backend, on accepte simplement les tableaux fournis par le front.
    
    return notificationsRepository.create({
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
  async getAllForUser(
    userId: string,
    schoolId: string,
    userRole: Role,
    campusIds: string[],
    classId: string | null,
    opts: {
      isRead?: boolean;
      type?: NotificationType;
      skip?: number;
      limit?: number;
    }
  ) {
    const filters: NotificationFilters = {
      isRead: opts.isRead,
      type: opts.type,
    };

    return notificationsRepository.findAllForUser(
      userId,
      schoolId,
      userRole,
      campusIds,
      classId,
      filters,
      { skip: opts.skip, limit: opts.limit }
    );
  },

  async markAsReadForUser(userId: string, id: string) {
    const updated = await notificationsRepository.markAsRead(id, userId);

    if (updated.count === 0) {
      throw new NotFoundError('Notification non trouvée ou déjà lue');
    }
  },

  async delete(id: string, schoolId: string) {
    const notif = await notificationsRepository.findById(id);
    if (!notif || notif.schoolId !== schoolId) {
      throw new NotFoundError('Notification');
    }
    return notificationsRepository.delete(id);
  }
};
