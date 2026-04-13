export declare const professorsService: {
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        _count: {
            evaluations: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        email: string;
        firstName: string;
        lastName: string;
        userId: string | null;
    }>>;
    getById(id: string): Promise<{
        evaluations: ({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        email: string;
        firstName: string;
        lastName: string;
        userId: string | null;
    }>;
    create(data: {
        firstName: string;
        lastName: string;
        email: string;
        userId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        email: string;
        firstName: string;
        lastName: string;
        userId: string | null;
    }>;
    update(id: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        userId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        email: string;
        firstName: string;
        lastName: string;
        userId: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        email: string;
        firstName: string;
        lastName: string;
        userId: string | null;
    }>;
};
//# sourceMappingURL=professors.service.d.ts.map