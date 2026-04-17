import type { CreateEvaluationInput, UpdateEvaluationInput } from './evaluations.types';
export declare const evaluationsService: {
    create(input: CreateEvaluationInput, userId?: string, schoolId?: string | null): Promise<{
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string;
            levelId: string;
        };
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
    getById(id: string, userRole?: string, schoolId?: string | null): Promise<{
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
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        aiJobs: {
            result: import("@prisma/client/runtime/client").JsonValue | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.AiJobStatus;
            reportId: string | null;
            evaluationId: string | null;
            jobType: string;
            payload: import("@prisma/client/runtime/client").JsonValue;
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
    }>;
    getAll(query: Record<string, unknown>, userRole?: string, schoolId?: string | null): Promise<import("../../utils/pagination").PaginatedResult<{
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
    }>>;
    update(id: string, input: UpdateEvaluationInput, userId: string, userRole: string, schoolId?: string | null): Promise<{
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
    delete(id: string, userRole: string, schoolId?: string | null): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getStats(query: Record<string, unknown>, schoolId?: string | null): Promise<import("./evaluations.types").EvaluationStats>;
    triggerAiScoring(id: string, userRole: string, schoolId?: string | null): Promise<{
        queued: boolean;
        evaluationId: string;
    }>;
};
//# sourceMappingURL=evaluations.service.d.ts.map