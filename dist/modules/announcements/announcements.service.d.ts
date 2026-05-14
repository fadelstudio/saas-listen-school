import { CreateAnnouncementInput, UpdateAnnouncementInput } from './announcements.types';
export declare const announcementsService: {
    create(schoolId: string, data: CreateAnnouncementInput, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        isActive: boolean;
        title: string;
        description: string | null;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date | null;
    }>;
    getAll(schoolId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        isActive: boolean;
        title: string;
        description: string | null;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date | null;
    }[]>;
    getActive(schoolId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        isActive: boolean;
        title: string;
        description: string | null;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date | null;
    } | null>;
    update(id: string, schoolId: string, data: UpdateAnnouncementInput, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        isActive: boolean;
        title: string;
        description: string | null;
        imageUrl: string | null;
        startDate: Date;
        endDate: Date | null;
    } | null>;
    delete(id: string, schoolId: string, userRole: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    notifyActivation(schoolId: string, announcement: any): Promise<void>;
};
//# sourceMappingURL=announcements.service.d.ts.map