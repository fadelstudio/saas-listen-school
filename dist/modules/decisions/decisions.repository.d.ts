import { DecisionStatus, Prisma } from '@prisma/client';
import { CreateDecisionInput, UpdateDecisionInput, DecisionFilters } from './decisions.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const decisionsRepository: {
    create(data: CreateDecisionInput, deciderId: string): Promise<{
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
        title: string;
        status: import("@prisma/client").$Enums.DecisionStatus;
        dueDate: Date | null;
        priority: import("@prisma/client").$Enums.Priority;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        responsible: string | null;
        aiSuggestion: string | null;
    }>;
    findById(id: string): Promise<({
        evaluation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            moduleId: string;
            professorId: string;
            status: import("@prisma/client").$Enums.EvaluationStatus;
            isAnonymous: boolean;
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
        };
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
        title: string;
        status: import("@prisma/client").$Enums.DecisionStatus;
        dueDate: Date | null;
        priority: import("@prisma/client").$Enums.Priority;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        responsible: string | null;
        aiSuggestion: string | null;
    }) | null>;
    findAll(filters: DecisionFilters, pagination: PaginationArgs): Promise<{
        items: ({
            decider: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import("@prisma/client").$Enums.DecisionStatus;
            dueDate: Date | null;
            priority: import("@prisma/client").$Enums.Priority;
            evaluationId: string;
            deciderId: string;
            rationale: string | null;
            responsible: string | null;
            aiSuggestion: string | null;
        })[];
        total: number;
    }>;
    update(id: string, data: UpdateDecisionInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import("@prisma/client").$Enums.DecisionStatus;
        dueDate: Date | null;
        priority: import("@prisma/client").$Enums.Priority;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        responsible: string | null;
        aiSuggestion: string | null;
    }>;
    updateStatus(id: string, status: DecisionStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import("@prisma/client").$Enums.DecisionStatus;
        dueDate: Date | null;
        priority: import("@prisma/client").$Enums.Priority;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        responsible: string | null;
        aiSuggestion: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import("@prisma/client").$Enums.DecisionStatus;
        dueDate: Date | null;
        priority: import("@prisma/client").$Enums.Priority;
        evaluationId: string;
        deciderId: string;
        rationale: string | null;
        responsible: string | null;
        aiSuggestion: string | null;
    }>;
    existsById(id: string): Promise<boolean>;
};
export {};
//# sourceMappingURL=decisions.repository.d.ts.map