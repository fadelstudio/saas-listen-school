export declare const classesService: {
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        campus: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
        };
        _count: {
            users: number;
            reports: number;
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
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string;
        levelId: string;
    }>>;
    getById(id: string): Promise<{
        campus: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
        };
        users: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        }[];
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
        };
        reports: {
            type: import("@prisma/client").$Enums.ReportType;
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
            attachments: import("@prisma/client/runtime/client").JsonValue | null;
            deviceMetadata: import("@prisma/client/runtime/client").JsonValue | null;
            aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
        classModules: ({
            professors: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                firstName: string;
                lastName: string;
                campusId: string | null;
                userId: string | null;
            }[];
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
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string;
        levelId: string;
    }>;
    create(data: {
        name: string;
        campusId: string;
        levelId: string;
    }): Promise<{
        campus: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
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
        campusId: string;
        levelId: string;
    }>;
    update(id: string, data: {
        name?: string;
        campusId?: string;
        levelId?: string;
    }): Promise<{
        campus: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
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
        campusId: string;
        levelId: string;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string;
        levelId: string;
    }>;
    getStudents(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        isActive: boolean;
        campusId: string | null;
    }[]>;
};
//# sourceMappingURL=classes.service.d.ts.map