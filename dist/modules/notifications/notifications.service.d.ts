import { NotificationType, SendBroadcastInput } from './notifications.types';
import { Role } from '@prisma/client';
export declare const notificationService: {
    /**
     * Crée une notification individuelle ou globale simple.
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
    }>;
    /**
     * Envoie une notification ciblée (Broadcast).
     * Supporte maintenant les ciblages multiples via tableaux.
     */
    sendBroadcast(schoolId: string, data: SendBroadcastInput): Promise<{
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
    }>;
    /**
     * Récupère les notifications pour un utilisateur donné, incluant les ciblages.
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
    }>;
};
//# sourceMappingURL=notifications.service.d.ts.map