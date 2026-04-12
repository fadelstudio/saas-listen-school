import { Prisma } from '@prisma/client';
import { CreateEvaluationInput, UpdateEvaluationInput, EvaluationFilters, EvaluationStats } from './evaluations.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const evaluationsRepository: {
    create(data: CreateEvaluationInput, evaluatorId?: string): Promise<{
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
    findById(id: string): Promise<({
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
    }) | null>;
    findAll(filters: EvaluationFilters, pagination: PaginationArgs): Promise<{
        items: ({
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
        })[];
        total: number;
    }>;
    update(id: string, data: UpdateEvaluationInput): Promise<{
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
    delete(id: string): Promise<{
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
    existsById(id: string): Promise<boolean>;
    updateAiScore(id: string, aiScore: number): Promise<{
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
    getAggregatedStats(filters: EvaluationFilters): Promise<EvaluationStats>;
};
export {};
//# sourceMappingURL=evaluations.repository.d.ts.map