import type { EvaluationCampaignFilters } from './evaluation-campaigns.types';
export declare const evaluationCampaignsRepository: {
    findAll(filters: EvaluationCampaignFilters, pagination: {
        skip: number;
        limit: number;
    }): Promise<{
        items: ({
            _count: {
                evaluations: number;
            };
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                campusId: string;
                levelId: string;
            } | null;
            module: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
            };
            professor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                firstName: string;
                lastName: string;
                campusId: string | null;
                userId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string | null;
            classId: string | null;
            title: string;
            status: string;
            professorId: string;
            moduleId: string;
            description: string | null;
            scope: string;
            dueDate: Date;
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
        campus: ({
            users: {
                id: string;
                role: import("@prisma/client").$Enums.Role;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
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
            campusId: string;
            levelId: string;
        }) | null;
        module: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
        };
        professor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            campusId: string | null;
            userId: string | null;
        };
        evaluations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            classId: string;
            status: import("@prisma/client").$Enums.EvaluationStatus;
            isAnonymous: boolean;
            professorId: string;
            moduleId: string;
            reportId: string | null;
            evaluatorId: string | null;
            score: number | null;
            comprehensionRating: import("@prisma/client").$Enums.RatingBand | null;
            explanationRating: import("@prisma/client").$Enums.RatingBand | null;
            pedagogyRating: import("@prisma/client").$Enums.RatingBand | null;
            availabilityRating: import("@prisma/client").$Enums.RatingBand | null;
            rhythmRating: import("@prisma/client").$Enums.RatingBand | null;
            comment: string | null;
            aiScore: number | null;
            campaignId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        classId: string | null;
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        description: string | null;
        scope: string;
        dueDate: Date;
    }) | null>;
    create(data: {
        title: string;
        description?: string;
        scope: string;
        classId?: string;
        campusId?: string;
        moduleId: string;
        professorId: string;
        dueDate: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        classId: string | null;
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        description: string | null;
        scope: string;
        dueDate: Date;
    }>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        classId: string | null;
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        description: string | null;
        scope: string;
        dueDate: Date;
    }>;
};
//# sourceMappingURL=evaluation-campaigns.repository.d.ts.map