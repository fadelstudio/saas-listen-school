import { DecisionStatus } from '@prisma/client';
import type { CreateDecisionInput, UpdateDecisionInput } from './decisions.types';
export declare const decisionsService: {
    create(input: CreateDecisionInput, userId: string, userRole: string): Promise<{
        evaluation: {
            id: string;
            status: import("@prisma/client").$Enums.EvaluationStatus;
            score: number | null;
        };
        decider: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DecisionStatus;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        aiSuggestion: string | null;
    }>;
    getById(id: string): Promise<{
        evaluation: {
            comments: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.EvaluationStatus;
            reportId: string;
            evaluatorId: string;
            score: number | null;
            aiScore: number | null;
        };
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
        decider: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DecisionStatus;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        aiSuggestion: string | null;
    }>;
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        decider: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DecisionStatus;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        aiSuggestion: string | null;
    }>>;
    update(id: string, input: UpdateDecisionInput, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DecisionStatus;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        aiSuggestion: string | null;
    }>;
    updateStatus(id: string, status: DecisionStatus, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DecisionStatus;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        aiSuggestion: string | null;
    }>;
    delete(id: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DecisionStatus;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        aiSuggestion: string | null;
    }>;
};
//# sourceMappingURL=decisions.service.d.ts.map