import type { CreateEvaluationInput, UpdateEvaluationInput } from './evaluations.types';
export declare const evaluationsService: {
    create(input: CreateEvaluationInput, userId?: string): Promise<{
        report: {
            id: string;
            title: string;
        };
        evaluator: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        comments: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.EvaluationStatus;
        reportId: string;
        evaluatorId: string;
        score: number | null;
        aiScore: number | null;
    }>;
    getById(id: string): Promise<{
        report: {
            id: string;
            title: string;
            status: import("@prisma/client").$Enums.ReportStatus;
        };
        decision: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.DecisionStatus;
            evaluationId: string;
            deciderId: string;
            rationale: string | null;
            aiSuggestion: string | null;
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
        evaluator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        comments: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.EvaluationStatus;
        reportId: string;
        evaluatorId: string;
        score: number | null;
        aiScore: number | null;
    }>;
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        report: {
            id: string;
            title: string;
        };
        evaluator: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        comments: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.EvaluationStatus;
        reportId: string;
        evaluatorId: string;
        score: number | null;
        aiScore: number | null;
    }>>;
    update(id: string, input: UpdateEvaluationInput, userId: string, userRole: string): Promise<{
        comments: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.EvaluationStatus;
        reportId: string;
        evaluatorId: string;
        score: number | null;
        aiScore: number | null;
    }>;
    delete(id: string, userRole: string): Promise<{
        comments: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.EvaluationStatus;
        reportId: string;
        evaluatorId: string;
        score: number | null;
        aiScore: number | null;
    }>;
    getStats(query: Record<string, unknown>): Promise<import("./evaluations.types").EvaluationStats>;
    triggerAiScoring(id: string, userRole: string): Promise<{
        queued: boolean;
        evaluationId: string;
    }>;
};
//# sourceMappingURL=evaluations.service.d.ts.map