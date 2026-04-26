import { Prisma, Role } from '@prisma/client';
import { NotificationType, NotificationFilters } from './notifications.types';
export declare const notificationsRepository: {
    create(data: {
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
    }): Promise<{
        type: string;
        message: string;
        url: string | null;
        attachments: Prisma.JsonValue | null;
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
    findAllForUser(userId: string, schoolId: string, userRole: Role, campusIds: string[], classId: string | null, filters: NotificationFilters, pagination: {
        skip?: number;
        limit?: number;
    }): Promise<{
        items: {
            type: string;
            message: string;
            url: string | null;
            attachments: Prisma.JsonValue | null;
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
     * Récupère les notifications pour un invité identifié par son UTI.
     */
    findAllForGuest(uti: string, pagination: {
        skip?: number;
        limit?: number;
    }): Promise<{
        items: {
            type: string;
            message: string;
            url: string | null;
            attachments: Prisma.JsonValue | null;
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
    markAsRead(id: string, userId: string): Promise<Prisma.BatchPayload>;
    markAsReadForGuest(id: string, uti: string): Promise<Prisma.BatchPayload>;
    findById(id: string): Promise<{
        type: string;
        message: string;
        url: string | null;
        attachments: Prisma.JsonValue | null;
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
    delete(id: string): Promise<{
        type: string;
        message: string;
        url: string | null;
        attachments: Prisma.JsonValue | null;
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
};
//# sourceMappingURL=notifications.repository.d.ts.map