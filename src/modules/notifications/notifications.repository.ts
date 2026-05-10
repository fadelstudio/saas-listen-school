import { prisma } from '../../core/database/prisma';
import { Prisma, Role } from '@prisma/client';
import { NotificationType, NotificationFilters } from './notifications.types';

// ─────────────────────────────────────────────────────────────────────────────
// Rôles "administratifs" — voient les notifications de leur école entière
// (non filtrées par campus/classe spécifique)
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_ROLES: Role[] = [Role.SUPERADMIN, Role.ADMIN, Role.MANAGER];

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
function buildBroadcastFilter(
  userRole: Role,
  campusIds: string[],
  classId: string | null,
): Prisma.NotificationWhereInput {
  // ── Filtre sur le rôle ────────────────────────────────────────────────────
  const roleCondition: Prisma.NotificationWhereInput = {
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
  let campusCondition: Prisma.NotificationWhereInput;

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
  } else {
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
  let classCondition: Prisma.NotificationWhereInput;

  if (ADMIN_ROLES.includes(userRole)) {
    // Admin : voit seulement les broadcasts non ciblés sur une classe spécifique
    classCondition = { targetClassIds: { isEmpty: true } };
  } else if (classId) {
    // Student avec classe : voit broadcasts tous (isEmpty) OU sa classe
    classCondition = {
      OR: [
        { targetClassIds: { isEmpty: true } },
        { targetClassIds: { has: classId } },
      ],
    };
  } else {
    // Student sans classe (cas rare) : voit seulement broadcasts globaux
    classCondition = { targetClassIds: { isEmpty: true } };
  }

  return {
    userId: null,
    targetDeviceUti: null,
    AND: [roleCondition, campusCondition, classCondition],
  };
}

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
        // 1. Notification directe
        { userId },
        // 2. Ciblage spécifique par ID
        { targetUserIds: { has: userId } },
        // 3. Broadcast (logique campus/rôle/classe)
        buildBroadcastFilter(userRole, campusIds, classId),
        // 4. Notifications système SaaS (SuperAdmin → toutes écoles)
        ...(userRole === Role.SUPERADMIN ? [{ userId: null, schoolId: null }] : []),
      ],
      ...(typeof filters.isRead === 'boolean' ? { isRead: filters.isRead } : {}),
      ...(filters.type ? { type: filters.type } : {}),
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

  async countUnread(
    userId: string,
    schoolId: string,
    userRole: Role,
    campusIds: string[],
    classId: string | null
  ) {
    const where: Prisma.NotificationWhereInput = {
      schoolId,
      isRead: false,
      OR: [
        { userId },
        { targetUserIds: { has: userId } },
        buildBroadcastFilter(userRole, campusIds, classId),
        ...(userRole === Role.SUPERADMIN ? [{ userId: null, schoolId: null }] : []),
      ],
    };

    return prisma.notification.count({ where });
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

  /**
   * Marquer comme lue — vérifie que la notification appartient à l'utilisateur.
   * Couvre : direct (userId), ciblé (targetUserIds), broadcast (userId null sans cible UTI).
   */
  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
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
