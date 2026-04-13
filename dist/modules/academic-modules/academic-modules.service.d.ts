export declare const academicModulesService: {
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        _count: {
            reports: number;
            evaluations: number;
            classModules: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }>>;
    getById(id: string): Promise<{
        evaluations: ({
            evaluator: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                campusId: string | null;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                matricule: string | null;
                role: import("@prisma/client").$Enums.Role;
                isActive: boolean;
                classId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            moduleId: string;
            professorId: string;
            status: import("@prisma/client").$Enums.EvaluationStatus;
            isAnonymous: boolean;
            reportId: string | null;
            evaluatorId: string | null;
            score: number | null;
            clarityScore: number | null;
            pedagogyScore: number | null;
            availabilityScore: number | null;
            rhythmScore: number | null;
            comment: string | null;
            aiScore: number | null;
            campaignId: string | null;
        })[];
        classModules: ({
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                levelId: string;
                campusId: string;
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
        code: string | null;
    }>;
    create(data: {
        name: string;
        code?: string;
    }): Promise<{
        _count: {
            classModules: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }>;
    update(id: string, data: {
        name?: string;
        code?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }>;
};
//# sourceMappingURL=academic-modules.service.d.ts.map