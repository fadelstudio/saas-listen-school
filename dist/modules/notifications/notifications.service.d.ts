import { NotificationType, SendBroadcastInput } from './notifications.types';
import { Role } from '@prisma/client';
export declare const notificationService: {
    /**
     * Crée une notification en base ET envoie un push FCM si un token est disponible.
     * Gère tous les cas : utilisateur connecté, invité (UTI), broadcast.
     */
    create(data: {
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
    }): Promise<{
        type: string;
        message: string;
        url: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        schoolId: string | null;
        title: string;
        campaignId: string | null;
        isRead: boolean;
        userId: string | null;
        targetRoles: import("@prisma/client").$Enums.Role[];
        targetCampusIds: string[];
        targetClassIds: string[];
        targetUserIds: string[];
        targetRole: import("@prisma/client").$Enums.Role | null;
        targetCampusId: string | null;
        targetClassId: string | null;
        targetDeviceUti: string | null;
    } | null>;
    /**
     * Dispatch FCM en fire-and-forget selon la cible.
     */
    _dispatchPush(data: {
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
    }, notifId: string): Promise<void>;
    /**
     * Envoie un broadcast ciblé (Admin/Manager).
     *
     * Isolation MANAGER : un Manager ne peut cibler que ses propres campus.
     * Si targetCampusIds contient des campus hors de son périmètre, ils sont ignorés.
     * Un broadcast "tous campus" d'un Manager est automatiquement restreint à ses campus.
     */
    sendBroadcast(schoolId: string, data: SendBroadcastInput, senderRole?: string, senderCampusIds?: string[]): Promise<{
        type: string;
        message: string;
        url: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        schoolId: string | null;
        title: string;
        campaignId: string | null;
        isRead: boolean;
        userId: string | null;
        targetRoles: import("@prisma/client").$Enums.Role[];
        targetCampusIds: string[];
        targetClassIds: string[];
        targetUserIds: string[];
        targetRole: import("@prisma/client").$Enums.Role | null;
        targetCampusId: string | null;
        targetClassId: string | null;
        targetDeviceUti: string | null;
    }>;
    /**
     * Récupère les notifications pour un utilisateur connecté.
     */
    getAllForUser(userId: string, schoolId: string, userRole: Role, campusIds: string[], classId: string | null, opts: {
        isRead?: boolean;
        type?: NotificationType;
        skip?: number;
        limit?: number;
    }): Promise<{
        items: {
            type: string;
            message: string;
            url: string | null;
            attachments: import("@prisma/client/runtime/client").JsonValue | null;
            id: string;
            createdAt: Date;
            schoolId: string | null;
            title: string;
            campaignId: string | null;
            isRead: boolean;
            userId: string | null;
            targetRoles: import("@prisma/client").$Enums.Role[];
            targetCampusIds: string[];
            targetClassIds: string[];
            targetUserIds: string[];
            targetRole: import("@prisma/client").$Enums.Role | null;
            targetCampusId: string | null;
            targetClassId: string | null;
            targetDeviceUti: string | null;
        }[];
        total: number;
    }>;
    /**
     * Récupère les notifications pour un invité via son UTI (Unique Tracking Identifier).
     */
    getAllForGuest(uti: string, opts: {
        skip?: number;
        limit?: number;
    }): Promise<{
        items: {
            type: string;
            message: string;
            url: string | null;
            attachments: import("@prisma/client/runtime/client").JsonValue | null;
            id: string;
            createdAt: Date;
            schoolId: string | null;
            title: string;
            campaignId: string | null;
            isRead: boolean;
            userId: string | null;
            targetRoles: import("@prisma/client").$Enums.Role[];
            targetCampusIds: string[];
            targetClassIds: string[];
            targetUserIds: string[];
            targetRole: import("@prisma/client").$Enums.Role | null;
            targetCampusId: string | null;
            targetClassId: string | null;
            targetDeviceUti: string | null;
        }[];
        total: number;
    }>;
    markAsReadForUser(userId: string, id: string): Promise<void>;
    delete(id: string, schoolId: string): Promise<{
        type: string;
        message: string;
        url: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        schoolId: string | null;
        title: string;
        campaignId: string | null;
        isRead: boolean;
        userId: string | null;
        targetRoles: import("@prisma/client").$Enums.Role[];
        targetCampusIds: string[];
        targetClassIds: string[];
        targetUserIds: string[];
        targetRole: import("@prisma/client").$Enums.Role | null;
        targetCampusId: string | null;
        targetClassId: string | null;
        targetDeviceUti: string | null;
    }>;
    /**
     * Enregistre le token FCM d'un invité (UTI).
     */
    registerGuestFcmToken(uti: string, fcmToken: string): Promise<void>;
    /**
     * Met à jour le token FCM d'un utilisateur (appelé après login/register).
     * Fait aussi la fusion invité → compte si un UTI est fourni.
     */
    updateFcmToken(userId: string, fcmToken: string, uti?: string): Promise<void>;
    getUnreadCount(userId: string, schoolId: string, userRole: Role, campusIds: string[], classId: string | null): Promise<number>;
};
//# sourceMappingURL=notifications.service.d.ts.map