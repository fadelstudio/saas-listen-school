import type { CreateEvaluationCampaignInput } from './evaluation-campaigns.schema';
export declare const evaluationCampaignsService: {
    create(data: CreateEvaluationCampaignInput, schoolId: string): Promise<{
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
    getAll(schoolId: string, query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        module: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        };
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
        professor: {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            firstName: string;
            lastName: string;
            matricule: string | null;
            numero: string | null;
            avatarPath: string | null;
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
    }>>;
    getById(id: string, schoolId: string): Promise<{
        campus: ({
            users: {
                id: string;
                role: import("@prisma/client").$Enums.Role;
            }[];
        } & {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
            phone: string | null;
        }) | null;
        module: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        };
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
        professor: {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            firstName: string;
            lastName: string;
            matricule: string | null;
            numero: string | null;
            avatarPath: string | null;
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
    }>;
    close(id: string, schoolId: string): Promise<{
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
//# sourceMappingURL=evaluation-campaigns.service.d.ts.map