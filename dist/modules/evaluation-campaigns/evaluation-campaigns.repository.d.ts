import type { EvaluationCampaignFilters } from './evaluation-campaigns.types';
export declare const evaluationCampaignsRepository: {
    findAll(filters: EvaluationCampaignFilters, pagination: {
        skip: number;
        limit: number;
    }): Promise<{
        items: ({
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
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
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
    }) | null>;
    create(data: {
        title: string;
        description?: string;
        classId: string;
        moduleId: string;
        professorId: string;
        dueDate?: Date;
    }): Promise<{
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
    updateStatus(id: string, status: string): Promise<{
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
//# sourceMappingURL=evaluation-campaigns.repository.d.ts.map