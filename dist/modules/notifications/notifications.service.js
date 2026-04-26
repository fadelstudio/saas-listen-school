"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const notifications_repository_1 = require("./notifications.repository");
const AppError_1 = require("../../core/errors/AppError");
const fcm_service_1 = require("../../core/push/fcm.service");
const prisma_1 = require("../../core/database/prisma");
const logger_1 = require("../../utils/logger");
// ─────────────────────────────────────────────────────────────────────────────
// Anti-spam: garde en mémoire les envois récents par clé (UTI ou userId)
// pour éviter les doublons rapides (max 1 notif d'un même type par 60s).
// ─────────────────────────────────────────────────────────────────────────────
const spamCache = new Map();
const SPAM_WINDOW_MS = 60000; // 60 secondes
function isSpam(key) {
    const last = spamCache.get(key);
    if (last && Date.now() - last < SPAM_WINDOW_MS)
        return true;
    spamCache.set(key, Date.now());
    // Nettoyage automatique (empêche la fuite mémoire)
    setTimeout(() => spamCache.delete(key), SPAM_WINDOW_MS * 2);
    return false;
}
// ─────────────────────────────────────────────────────────────────────────────
// Résolution des FCM tokens pour une notification ciblée
// (cherche dans User.fcmToken pour les utilisateurs identifiés)
// ─────────────────────────────────────────────────────────────────────────────
async function resolveTokensForBroadcast(data) {
    if (!fcm_service_1.fcmService.isEnabled())
        return [];
    const where = { fcmToken: { not: null } };
    if (data.targetUserIds?.length) {
        where.id = { in: data.targetUserIds };
    }
    else {
        const conditions = [];
        if (data.schoolId)
            conditions.push({ schoolId: data.schoolId });
        if (data.targetRoles?.length)
            conditions.push({ role: { in: data.targetRoles } });
        if (data.targetCampusIds?.length)
            conditions.push({ campuses: { some: { id: { in: data.targetCampusIds } } } });
        if (data.targetClassIds?.length)
            conditions.push({ classId: { in: data.targetClassIds } });
        if (conditions.length)
            where.AND = conditions;
    }
    const users = await prisma_1.prisma.user.findMany({ where, select: { fcmToken: true } });
    return users.map(u => u.fcmToken).filter(Boolean);
}
// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────
exports.notificationService = {
    /**
     * Crée une notification en base ET envoie un push FCM si un token est disponible.
     * Gère tous les cas : utilisateur connecté, invité (UTI), broadcast.
     */
    async create(data) {
        // ── Anti-spam ──
        const spamKey = `${data.userId ?? data.targetDeviceUti ?? 'broadcast'}:${data.type}`;
        if (isSpam(spamKey)) {
            logger_1.logger.warn('[Notification] Anti-spam bloqué.', { type: data.type, key: spamKey });
            return null;
        }
        // ── Persister en base ──
        const notification = await notifications_repository_1.notificationsRepository.create({
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
        this._dispatchPush(data, notification.id).catch(err => logger_1.logger.warn('[FCM] Push dispatch échoué (non bloquant).', { error: err?.message }));
        return notification;
    },
    /**
     * Dispatch FCM en fire-and-forget selon la cible.
     */
    async _dispatchPush(data, notifId) {
        if (!fcm_service_1.fcmService.isEnabled())
            return;
        const fcmData = {
            notificationId: notifId,
            type: data.type,
            ...(data.url ? { url: data.url } : {}),
        };
        // Cas 1 : Notification individuelle (userId connu)
        if (data.userId) {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: data.userId },
                select: { fcmToken: true },
            });
            if (user?.fcmToken) {
                await fcm_service_1.fcmService.sendToDevice({
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
            const users = await prisma_1.prisma.user.findMany({
                where: { id: { in: data.targetUserIds }, fcmToken: { not: null } },
                select: { fcmToken: true },
            });
            const tokens = users.map(u => u.fcmToken).filter(Boolean);
            if (tokens.length > 0) {
                await fcm_service_1.fcmService.sendToMultipleDevices({
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
            await fcm_service_1.fcmService.sendToMultipleDevices({
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
    async sendBroadcast(schoolId, data) {
        const notification = await notifications_repository_1.notificationsRepository.create({
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
        this._dispatchPush({ ...data, schoolId, type: 'BROADCAST' }, notification.id).catch(err => logger_1.logger.warn('[FCM] Broadcast push failed.', { error: err?.message }));
        return notification;
    },
    /**
     * Récupère les notifications pour un utilisateur connecté.
     */
    async getAllForUser(userId, schoolId, userRole, campusIds, classId, opts) {
        const filters = {
            isRead: opts.isRead,
            type: opts.type,
        };
        return notifications_repository_1.notificationsRepository.findAllForUser(userId, schoolId, userRole, campusIds, classId, filters, { skip: opts.skip, limit: opts.limit });
    },
    /**
     * Récupère les notifications pour un invité via son UTI (Unique Tracking Identifier).
     */
    async getAllForGuest(uti, opts) {
        return notifications_repository_1.notificationsRepository.findAllForGuest(uti, opts);
    },
    async markAsReadForUser(userId, id) {
        const updated = await notifications_repository_1.notificationsRepository.markAsRead(id, userId);
        if (updated.count === 0) {
            throw new AppError_1.NotFoundError('Notification non trouvée ou déjà lue');
        }
    },
    async delete(id, schoolId) {
        const notif = await notifications_repository_1.notificationsRepository.findById(id);
        if (!notif || notif.schoolId !== schoolId) {
            throw new AppError_1.NotFoundError('Notification');
        }
        return notifications_repository_1.notificationsRepository.delete(id);
    },
    /**
     * Met à jour le token FCM d'un utilisateur (appelé après login/register).
     * Fait aussi la fusion invité → compte si un UTI est fourni.
     */
    async updateFcmToken(userId, fcmToken, uti) {
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { fcmToken },
        });
        // Fusion des notifications invité → compte utilisateur
        if (uti) {
            await prisma_1.prisma.notification.updateMany({
                where: { targetDeviceUti: uti, userId: null },
                data: { userId, targetDeviceUti: null },
            });
            // Fusion des rapports anonymes
            await prisma_1.prisma.report.updateMany({
                where: {
                    authorId: null,
                    deviceMetadata: { path: ['uti'], equals: uti },
                },
                data: { authorId: userId },
            });
            logger_1.logger.info('[Notification] Fusion invité → compte effectuée.', { userId, uti });
        }
    },
};
//# sourceMappingURL=notifications.service.js.map