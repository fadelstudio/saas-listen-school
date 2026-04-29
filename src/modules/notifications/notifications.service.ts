import { NotificationType, SendBroadcastInput, NotificationFilters } from './notifications.types';
import { Role } from '@prisma/client';
import { notificationsRepository } from './notifications.repository';
import { NotFoundError } from '../../core/errors/AppError';
import { fcmService } from '../../core/push/fcm.service';
import { prisma } from '../../core/database/prisma';
import { logger } from '../../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Anti-spam: garde en mémoire les envois récents par clé (UTI ou userId)
// pour éviter les doublons rapides (max 1 notif d'un même type par 60s).
// ─────────────────────────────────────────────────────────────────────────────
const spamCache = new Map<string, number>();
const SPAM_WINDOW_MS = 60_000; // 60 secondes

function isSpam(key: string): boolean {
  const last = spamCache.get(key);
  if (last && Date.now() - last < SPAM_WINDOW_MS) return true;
  spamCache.set(key, Date.now());
  // Nettoyage automatique (empêche la fuite mémoire)
  setTimeout(() => spamCache.delete(key), SPAM_WINDOW_MS * 2);
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Résolution des FCM tokens pour une notification ciblée
// (cherche dans User.fcmToken pour les utilisateurs identifiés)
// ─────────────────────────────────────────────────────────────────────────────
async function resolveTokensForBroadcast(data: {
  targetUserIds?: string[];
  targetRoles?: Role[];
  targetCampusIds?: string[];
  targetClassIds?: string[];
  schoolId?: string | null;
}): Promise<string[]> {
  if (!fcmService.isEnabled()) return [];

  const where: any = { fcmToken: { not: null } };

  if (data.targetUserIds?.length) {
    where.id = { in: data.targetUserIds };
  } else {
    const conditions: any[] = [];
    if (data.schoolId) conditions.push({ schoolId: data.schoolId });
    if (data.targetRoles?.length) conditions.push({ role: { in: data.targetRoles } });
    if (data.targetCampusIds?.length) conditions.push({ campuses: { some: { id: { in: data.targetCampusIds } } } });
    if (data.targetClassIds?.length) conditions.push({ classId: { in: data.targetClassIds } });
    if (conditions.length) where.AND = conditions;
  }

  const users = await prisma.user.findMany({ where, select: { fcmToken: true } });
  const tokens = users.map(u => u.fcmToken!).filter(Boolean);
  return [...new Set(tokens)];
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const notificationService = {
  /**
   * Crée une notification en base ET envoie un push FCM si un token est disponible.
   * Gère tous les cas : utilisateur connecté, invité (UTI), broadcast.
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
    targetDeviceUti?: string | null;
    campaignId?: string | null;
    schoolId?: string | null;
    url?: string | null;
  }) {
    // ── Anti-spam ──
    const spamKey = `${data.userId ?? data.targetDeviceUti ?? 'broadcast'}:${data.type}`;
    if (isSpam(spamKey)) {
      logger.warn('[Notification] Anti-spam bloqué.', { type: data.type, key: spamKey });
      return null;
    }

    // ── Persister en base ──
    const notification = await notificationsRepository.create({
      title: data.title,
      message: data.message,
      type: data.type,
      userId: data.userId ?? null,
      targetRoles: data.targetRoles,
      targetCampusIds: data.targetCampusIds,
      targetClassIds: data.targetClassIds,
      targetUserIds: data.targetUserIds,
      targetDeviceUti: data.targetDeviceUti ?? null,
      campaignId: data.campaignId ?? null,
      schoolId: data.schoolId ?? null,
      url: data.url ?? null,
    });

    // ── Déclencher le push FCM en arrière-plan (ne bloque pas la réponse HTTP) ──
    this._dispatchPush(data, notification.id).catch(err =>
      logger.warn('[FCM] Push dispatch échoué (non bloquant).', { error: err?.message })
    );

    return notification;
  },

  /**
   * Dispatch FCM en fire-and-forget selon la cible.
   */
  async _dispatchPush(
    data: {
      title: string;
      message: string;
      type: NotificationType;
      userId?: string | null;
      targetRoles?: Role[];
      targetCampusIds?: string[];
      targetClassIds?: string[];
      targetUserIds?: string[];
      targetDeviceUti?: string | null;
      schoolId?: string | null;
      url?: string | null;
    },
    notifId: string
  ): Promise<void> {
    if (!fcmService.isEnabled()) return;

    const fcmData: Record<string, string> = {
      notificationId: notifId,
      type: data.type,
      ...(data.url ? { url: data.url } : {}),
    };

    // Cas 1 : Notification individuelle (userId connu)
    if (data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { fcmToken: true },
      });
      if (user?.fcmToken) {
        await fcmService.sendToDevice({
          token: user.fcmToken,
          title: data.title,
          body: data.message,
          data: fcmData,
        });
      }
      return;
    }

    // Cas 2 : Notification à une liste d'utilisateurs (targetUserIds)
    if (data.targetUserIds?.length) {
      const users = await prisma.user.findMany({
        where: { id: { in: data.targetUserIds }, fcmToken: { not: null } },
        select: { fcmToken: true },
      });
      const tokens = [...new Set(users.map(u => u.fcmToken!).filter(Boolean))];
      if (tokens.length > 0) {
        await fcmService.sendToMultipleDevices({
          tokens,
          title: data.title,
          body: data.message,
          data: fcmData,
        });
      }
      return;
    }

    // Cas 3 : Broadcast ciblé (rôles / campus / classes)
    const tokens = await resolveTokensForBroadcast(data);
    if (tokens.length > 0) {
      await fcmService.sendToMultipleDevices({
        tokens,
        title: data.title,
        body: data.message,
        data: fcmData,
      });
    }
  },

  /**
   * Envoie un broadcast ciblé (Admin+).
   */
  async sendBroadcast(schoolId: string, data: SendBroadcastInput) {
    const notification = await notificationsRepository.create({
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

    // FCM broadcast en parallèle
    this._dispatchPush(
      { ...data, schoolId, type: 'BROADCAST' },
      notification.id
    ).catch(err => logger.warn('[FCM] Broadcast push failed.', { error: err?.message }));

    return notification;
  },

  /**
   * Récupère les notifications pour un utilisateur connecté.
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

  /**
   * Récupère les notifications pour un invité via son UTI (Unique Tracking Identifier).
   */
  async getAllForGuest(
    uti: string,
    opts: { skip?: number; limit?: number }
  ) {
    return notificationsRepository.findAllForGuest(uti, opts);
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
  },

  /**
   * Met à jour le token FCM d'un utilisateur (appelé après login/register).
   * Fait aussi la fusion invité → compte si un UTI est fourni.
   */
  async updateFcmToken(userId: string, fcmToken: string, uti?: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });

    // Fusion des notifications invité → compte utilisateur
    if (uti) {
      await prisma.notification.updateMany({
        where: { targetDeviceUti: uti, userId: null },
        data: { userId, targetDeviceUti: null },
      });
      // Fusion des rapports anonymes
      await prisma.report.updateMany({
        where: {
          authorId: null,
          deviceMetadata: { path: ['uti'], equals: uti },
        },
        data: { authorId: userId },
      });
      logger.info('[Notification] Fusion invité → compte effectuée.', { userId, uti });
    }
  },

  async getUnreadCount(userId: string, schoolId: string, userRole: Role, campusIds: string[], classId: string | null) {
    return notificationsRepository.countUnread(userId, schoolId, userRole, campusIds, classId);
  },
};
