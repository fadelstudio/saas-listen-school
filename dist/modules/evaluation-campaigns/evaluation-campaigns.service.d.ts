import type { CreateEvaluationCampaignInput } from './evaluation-campaigns.schema';
export declare const evaluationCampaignsService: {
    create(data: CreateEvaluationCampaignInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        classId: string | null;
        title: string;
        description: string | null;
        scope: string;
        moduleId: string;
        professorId: string;
        status: string;
        dueDate: Date;
    }>;
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        } | null;
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
        campusId: string | null;
        classId: string | null;
        title: string;
        description: string | null;
        scope: string;
        moduleId: string;
        professorId: string;
        status: string;
        dueDate: Date;
    }>>;
    getById(id: string): Promise<{
        campus: ({
            users: {
                id: string;
                role: import("@prisma/client").$Enums.Role;
            }[];
        } & {
            name: string;
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null;
        class: ({
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
        }) | null;
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
        campusId: string | null;
        classId: string | null;
        title: string;
        description: string | null;
        scope: string;
        moduleId: string;
        professorId: string;
        status: string;
        dueDate: Date;
    }>;
    close(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        classId: string | null;
        title: string;
        description: string | null;
        scope: string;
        moduleId: string;
        professorId: string;
        status: string;
        dueDate: Date;
    }>;
};
//# sourceMappingURL=evaluation-campaigns.service.d.ts.map