import { Prisma } from '@prisma/client';
import { CreateEvaluationInput, UpdateEvaluationInput, EvaluationFilters, EvaluationStats } from './evaluations.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const evaluationsRepository: {
    getUserContext(userId: string): Promise<{
        campusId: string | null;
        classId: string | null;
    } | null>;
    create(data: CreateEvaluationInput, evaluatorId?: string, schoolId?: string | null): Promise<{
        module: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        };
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string;
            levelId: string;
        };
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
        evaluator: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
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
    }>;
    findById(id: string, schoolId?: string | null): Promise<({
        report: {
            id: string;
            title: string;
            status: import("@prisma/client").$Enums.ReportStatus;
        } | null;
        decision: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            priority: import("@prisma/client").$Enums.Priority;
            status: import("@prisma/client").$Enums.DecisionStatus;
            reportId: string | null;
            dueDate: Date | null;
            evaluationId: string | null;
            deciderId: string;
            rationale: string | null;
            responsible: string | null;
            aiSuggestion: string | null;
        } | null;
        evaluator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        aiJobs: {
            result: Prisma.JsonValue | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.AiJobStatus;
            reportId: string | null;
            evaluationId: string | null;
            jobType: string;
            payload: Prisma.JsonValue;
            errorMessage: string | null;
            decisionId: string | null;
        }[];
    } & {
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
    }) | null>;
    findAll(filters: EvaluationFilters, pagination: PaginationArgs, schoolId?: string | null): Promise<{
        items: ({
            report: {
                id: string;
                title: string;
            } | null;
            evaluator: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
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
        })[];
        total: number;
    }>;
    update(id: string, data: UpdateEvaluationInput, schoolId?: string | null): Promise<{
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
    }>;
    delete(id: string, schoolId?: string | null): Promise<Prisma.BatchPayload>;
    existsById(id: string, schoolId?: string | null): Promise<boolean>;
    updateAiScore(id: string, aiScore: number): Promise<{
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
    }>;
    getAggregatedStats(filters: EvaluationFilters, schoolId?: string | null): Promise<EvaluationStats>;
};
export {};
//# sourceMappingURL=evaluations.repository.d.ts.map