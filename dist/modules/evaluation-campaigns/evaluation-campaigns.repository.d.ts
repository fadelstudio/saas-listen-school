import { Prisma } from '@prisma/client';
import type { EvaluationCampaignFilters } from './evaluation-campaigns.types';
/** Campagne rattachée au tenant : par classe, campus, ou portée école avec prof du campus. */
export declare function campaignInSchool(schoolId: string): Prisma.EvaluationCampaignWhereInput;
export declare const evaluationCampaignsRepository: {
    findAll(schoolId: string, filters: EvaluationCampaignFilters, pagination: {
        skip: number;
        limit: number;
    }): Promise<{
        items: ({
            module: {
                code: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
            } | null;
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
            } | null;
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
            professorId: string | null;
            moduleId: string | null;
            dueDate: Date;
            campusId: string | null;
            description: string | null;
            scope: string;
        })[];
        total: number;
    }>;
    findById(id: string, schoolId: string): Promise<({
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
        } | null;
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
        } | null;
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
        professorId: string | null;
        moduleId: string | null;
        dueDate: Date;
        campusId: string | null;
        description: string | null;
        scope: string;
    }) | null>;
    create(data: {
        title: string;
        description?: string;
        scope: string;
        classId?: string;
        campusId?: string;
        moduleId?: string;
        professorId?: string;
        dueDate: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string | null;
        title: string;
        status: string;
        professorId: string | null;
        moduleId: string | null;
        dueDate: Date;
        campusId: string | null;
        description: string | null;
        scope: string;
    }>;
    updateStatus(id: string, schoolId: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string | null;
        title: string;
        status: string;
        professorId: string | null;
        moduleId: string | null;
        dueDate: Date;
        campusId: string | null;
        description: string | null;
        scope: string;
    } | null>;
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
            } | null;
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
            } | null;
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
                id: string;
                createdAt: Date;
                score: number | null;
                comment: string | null;
                aiScore: number | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string | null;
            title: string;
            status: string;
            professorId: string | null;
            moduleId: string | null;
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
            analysisId: string | null;
        }) | null;
    } | null>;
};
//# sourceMappingURL=evaluation-campaigns.repository.d.ts.map