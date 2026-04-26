import { Prisma } from '@prisma/client';
export declare const classesService: {
    getAll(schoolId: string, query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        campus: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
            phone: string | null;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            order: number;
        };
        _count: {
            users: number;
            reports: number;
        };
        classModules: ({
            module: {
                code: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            moduleId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        levelId: string;
        campusId: string;
    }>>;
    getById(id: string, schoolId: string): Promise<{
        campus: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
            phone: string | null;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            order: number;
        };
        users: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        }[];
        reports: {
            type: import("@prisma/client").$Enums.ReportType;
            attachments: Prisma.JsonValue | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            classId: string | null;
            title: string;
            content: string;
            priority: import("@prisma/client").$Enums.Priority;
            status: import("@prisma/client").$Enums.ReportStatus;
            isAnonymous: boolean;
            category: string | null;
            authorId: string | null;
            professorId: string | null;
            moduleId: string | null;
            deviceMetadata: Prisma.JsonValue | null;
            aiAnalysis: Prisma.JsonValue | null;
        }[];
        classModules: ({
            module: {
                code: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
            };
            professors: {
                email: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string | null;
                phone: string | null;
                firstName: string;
                lastName: string;
                matricule: string | null;
                numero: string | null;
                avatarPath: string | null;
                userId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            moduleId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        levelId: string;
        campusId: string;
    }>;
    create(schoolId: string, data: {
        name: string;
        campusId: string;
        levelId: string;
    }): Promise<{
        campus: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
            phone: string | null;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            order: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        levelId: string;
        campusId: string;
    }>;
    update(id: string, schoolId: string, data: {
        name?: string;
        campusId?: string;
        levelId?: string;
    }): Promise<{
        campus: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
            phone: string | null;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            order: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        levelId: string;
        campusId: string;
    }>;
    delete(id: string, schoolId: string): Promise<void>;
    getStudents(id: string, schoolId: string): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        isActive: boolean;
        campuses: {
            id: string;
        }[];
    }[]>;
};
//# sourceMappingURL=classes.service.d.ts.map