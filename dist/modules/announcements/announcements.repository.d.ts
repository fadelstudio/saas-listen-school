import { CreateAnnouncementInput, UpdateAnnouncementInput } from './announcements.types';
export declare const announcementsRepository: {
    create(schoolId: string, data: CreateAnnouncementInput): Promise<{
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
    findById(id: string, schoolId: string): Promise<{
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
    findAll(schoolId: string): Promise<{
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
    findActive(schoolId: string): Promise<{
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
    update(id: string, schoolId: string, data: UpdateAnnouncementInput): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deactivateAll(schoolId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    delete(id: string, schoolId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
};
//# sourceMappingURL=announcements.repository.d.ts.map