export declare const classesService: {
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        campus: {
            name: string;
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
        };
        classModules: ({
            module: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            moduleId: string;
        })[];
        _count: {
            users: number;
            reports: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        levelId: string;
        campusId: string;
    }>>;
    getById(id: string): Promise<{
        campus: {
            name: string;
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
        };
        users: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        }[];
        reports: {
            type: import("@prisma/client").$Enums.ReportType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string | null;
            title: string;
            moduleId: string | null;
            professorId: string | null;
            status: import("@prisma/client").$Enums.ReportStatus;
            content: string;
            priority: import("@prisma/client").$Enums.Priority;
            isAnonymous: boolean;
            category: string | null;
            authorId: string | null;
            attachments: import("@prisma/client/runtime/client").JsonValue | null;
            deviceMetadata: import("@prisma/client/runtime/client").JsonValue | null;
            aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
        classModules: ({
            module: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
            };
            professors: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                campusId: string | null;
                email: string;
                firstName: string;
                lastName: string;
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
    create(data: {
        name: string;
        campusId: string;
        levelId: string;
    }): Promise<{
        campus: {
            name: string;
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
    update(id: string, data: {
        name?: string;
        campusId?: string;
        levelId?: string;
    }): Promise<{
        campus: {
            name: string;
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
    delete(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        levelId: string;
        campusId: string;
    }>;
};
//# sourceMappingURL=classes.service.d.ts.map