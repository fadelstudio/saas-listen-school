"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
// ─────────────────────────────────────────────────────────────────────────────
// Rôles "administratifs" — voient les notifications de leur école entière
// (non filtrées par campus/classe spécifique)
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_ROLES = [client_1.Role.SUPERADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER];
/**
 * Construit le filtre WHERE pour récupérer les notifications d'un utilisateur connecté.
 *
 * Logique de visibilité :
 *   1. Notifications directes   → userId = moi
 *   2. Notifications ciblées    → targetUserIds contient mon ID
 *   3. Broadcasts               → combinaison de rôle + campus + classe (voir ci-dessous)
 *   4. Système SaaS (SuperAdmin)→ schoolId = null ET userId = null
 *
 * Règles de broadcast (cas 3) :
 *   • targetRoles vide      = broadcast à tous les rôles
 *   • targetCampusIds vide  = broadcast à tous les campus
 *   • targetClassIds vide   = broadcast à toutes les classes
 *
 *   Attention PostgreSQL : `hasSome: []` retourne false même si le tableau cible est vide.
 *   On utilise donc `isEmpty: true` comme condition de "broadcast total" sur chaque axe.
 *
 * Isolation MANAGER :
 *   Les MANAGER et ADMIN reçoivent les broadcasts de leur campus MÊME si
 *   targetCampusIds est vide (ils font partie de l'école).
 *   En revanche, un broadcast ciblé sur campus=[X] n'est visible que si X ∈ campusIds.
 */
function buildBroadcastFilter(userRole, campusIds, classId) {
    // ── Filtre sur le rôle ────────────────────────────────────────────────────
    const roleCondition = {
        OR: [
            { targetRoles: { isEmpty: true } },
            { targetRoles: { has: userRole } },
        ],
    };
    // ── Filtre sur le campus ──────────────────────────────────────────────────
    // Si l'utilisateur est admin/manager/superadmin : il voit TOUS les broadcasts
    // de son école, qu'ils soient ciblés sur un campus ou non.
    // Si l'utilisateur est student/professor/agent : il voit les broadcasts
    // non ciblés (isEmpty) OU ciblés sur un de ses campus.
    let campusCondition;
    if (ADMIN_ROLES.includes(userRole)) {
        // Admins voient tout : broadcasts ciblés tous campus (isEmpty)
        // ET broadcasts ciblés sur leur campus spécifique
        campusCondition = {
            OR: [
                { targetCampusIds: { isEmpty: true } },
                ...(campusIds.length > 0
                    ? [{ targetCampusIds: { hasSome: campusIds } }]
                    : []),
            ],
        };
    }
    else {
        // Users non-admin : seulement isEmpty (= tous) ou leur campus précis
        campusCondition =
            campusIds.length > 0
                ? {
                    OR: [
                        { targetCampusIds: { isEmpty: true } },
                        { targetCampusIds: { hasSome: campusIds } },
                    ],
                }
                : { targetCampusIds: { isEmpty: true } }; // pas de campus assigné → voit seulement les globaux
    }
    // ── Filtre sur la classe ──────────────────────────────────────────────────
    // Admins/Managers n'ont pas de classId → ils voient les broadcasts sans
    // restriction de classe (isEmpty) mais PAS ceux ciblés sur une classe précise
    // (ce serait uniquement pour les étudiants de cette classe).
    let classCondition;
    if (ADMIN_ROLES.includes(userRole)) {
        // Admin : voit seulement les broadcasts non ciblés sur une classe spécifique
        classCondition = { targetClassIds: { isEmpty: true } };
    }
    else if (classId) {
        // Student avec classe : voit broadcasts tous (isEmpty) OU sa classe
        classCondition = {
            OR: [
                { targetClassIds: { isEmpty: true } },
                { targetClassIds: { has: classId } },
            ],
        };
    }
    else {
        // Student sans classe (cas rare) : voit seulement broadcasts globaux
        classCondition = { targetClassIds: { isEmpty: true } };
    }
    return {
        userId: null,
        targetDeviceUti: null,
        AND: [roleCondition, campusCondition, classCondition],
    };
}
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
                // 1. Notification directe
                { userId },
                // 2. Ciblage spécifique par ID
                { targetUserIds: { has: userId } },
                // 3. Broadcast (logique campus/rôle/classe)
                buildBroadcastFilter(userRole, campusIds, classId),
                // 4. Notifications système SaaS (SuperAdmin → toutes écoles)
                ...(userRole === client_1.Role.SUPERADMIN ? [{ userId: null, schoolId: null }] : []),
            ],
            ...(typeof filters.isRead === 'boolean' ? { isRead: filters.isRead } : {}),
            ...(filters.type ? { type: filters.type } : {}),
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
    async countUnread(userId, schoolId, userRole, campusIds, classId) {
        const where = {
            schoolId,
            isRead: false,
            OR: [
                { userId },
                { targetUserIds: { has: userId } },
                buildBroadcastFilter(userRole, campusIds, classId),
                ...(userRole === client_1.Role.SUPERADMIN ? [{ userId: null, schoolId: null }] : []),
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
    /**
     * Marquer comme lue — vérifie que la notification appartient à l'utilisateur.
     * Couvre : direct (userId), ciblé (targetUserIds), broadcast (userId null sans cible UTI).
     */
    async markAsRead(id, userId) {
        return prisma_1.prisma.notification.updateMany({
            where: {
                id,
                OR: [
                    // Notification directe
                    { userId },
                    // Ciblée par ID
                    { targetUserIds: { has: userId } },
                    // Broadcast (pas de destinataire individuel)
                    { userId: null, targetDeviceUti: null, targetUserIds: { isEmpty: true } },
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