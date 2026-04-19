import type { CreateEvaluationCampaignInput } from './evaluation-campaigns.schema';
export declare const evaluationCampaignsService: {
    create(data: CreateEvaluationCampaignInput, schoolId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string | null;
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        dueDate: Date;
        campusId: string | null;
        description: string | null;
        scope: string;
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
        professor: {
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
        };
        _count: {
            evaluations: number;
        };
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string | null;
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        dueDate: Date;
        campusId: string | null;
        description: string | null;
        scope: string;
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
        professor: {
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
            levelId: string;
            campusId: string;
        }) | null;
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
        classId: string | null;
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        dueDate: Date;
        campusId: string | null;
        description: string | null;
        scope: string;
    }>;
    close(id: string, schoolId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string | null;
        title: string;
        status: string;
        professorId: string;
        moduleId: string;
        dueDate: Date;
        campusId: string | null;
        description: string | null;
        scope: string;
    }>;
    getAnalytics(id: string, schoolId: string): Promise<{
        campaign: {
            campus: ({
                users: {
                    id: string;
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
            professor: {
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
            };
            _count: {
                evaluations: number;
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
                levelId: string;
                campusId: string;
            }) | null;
            evaluations: {
                createdAt: Date;
                score: number | null;
                aiScore: number | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string | null;
            title: string;
            status: string;
            professorId: string;
            moduleId: string;
            dueDate: Date;
            campusId: string | null;
            description: string | null;
            scope: string;
        };
        stats: {
            totalExpected: number;
            totalDone: number;
            completionRate: number;
            avgScore: number;
            avgAiScore: number;
        };
        decision: ({
            decider: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            title: string;
            priority: import("@prisma/client").$Enums.Priority;
            status: import("@prisma/client").$Enums.DecisionStatus;
            reportId: string | null;
            campaignId: string | null;
            evaluationId: string | null;
            deciderId: string;
            rationale: string | null;
            responsible: string | null;
            dueDate: Date | null;
            aiSuggestion: string | null;
        }) | null;
    }>;
    generatePostDeadlineAnalysis(id: string, userId: string, schoolId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string | null;
        title: string;
        priority: import("@prisma/client").$Enums.Priority;
        status: import("@prisma/client").$Enums.DecisionStatus;
        reportId: string | null;
        campaignId: string | null;
        evaluationId: string | null;
        deciderId: string;
        rationale: string | null;
        responsible: string | null;
        dueDate: Date | null;
        aiSuggestion: string | null;
    }>;
};
//# sourceMappingURL=evaluation-campaigns.service.d.ts.map