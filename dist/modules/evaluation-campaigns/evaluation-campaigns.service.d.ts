import type { CreateEvaluationCampaignInput } from './evaluation-campaigns.schema';
export declare const evaluationCampaignsService: {
    create(data: CreateEvaluationCampaignInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        description: string | null;
        dueDate: Date | null;
    }>;
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        };
        professor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string | null;
            email: string;
            firstName: string;
            lastName: string;
            userId: string | null;
        };
        _count: {
            evaluations: number;
        };
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
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        description: string | null;
        dueDate: Date | null;
    }>>;
    getById(id: string): Promise<{
        class: {
            users: {
                id: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        };
        professor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string | null;
            email: string;
            firstName: string;
            lastName: string;
            userId: string | null;
        };
        evaluations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            status: import("@prisma/client").$Enums.EvaluationStatus;
            isAnonymous: boolean;
            professorId: string;
            moduleId: string;
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
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        description: string | null;
        dueDate: Date | null;
    }>;
    close(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        description: string | null;
        dueDate: Date | null;
    }>;
};
//# sourceMappingURL=evaluation-campaigns.service.d.ts.map