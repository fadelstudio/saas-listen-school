import { DecisionStatus } from '@prisma/client';
import type { CreateDecisionInput, UpdateDecisionInput } from './decisions.types';
export declare const decisionsService: {
    create(input: CreateDecisionInput, userId: string, userRole: string): Promise<{
        report: {
            type: import("@prisma/client").$Enums.ReportType;
            id: string;
            title: string;
        } | null;
        evaluation: {
            id: string;
            status: import("@prisma/client").$Enums.EvaluationStatus;
            score: number | null;
        } | null;
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
        priority: import("@prisma/client").$Enums.Priority;
        status: import("@prisma/client").$Enums.DecisionStatus;
        reportId: string | null;
        dueDate: Date | null;
        evaluationId: string | null;
        deciderId: string;
        rationale: string | null;
        responsible: string | null;
        aiSuggestion: string | null;
    }>;
    getById(id: string): Promise<{
        report: {
            type: import("@prisma/client").$Enums.ReportType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            classId: string | null;
            title: string;
            content: string;
            priority: import("@prisma/client").$Enums.Priority;
            status: import("@prisma/client").$Enums.ReportStatus;
            isAnonymous: boolean;
            category: string | null;
            authorId: string | null;
            professorId: string | null;
            moduleId: string | null;
            attachments: import("@prisma/client/runtime/client").JsonValue | null;
            deviceMetadata: import("@prisma/client/runtime/client").JsonValue | null;
            aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        } | null;
        evaluation: {
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
        priority: import("@prisma/client").$Enums.Priority;
        status: import("@prisma/client").$Enums.DecisionStatus;
        reportId: string | null;
        dueDate: Date | null;
        evaluationId: string | null;
        deciderId: string;
        rationale: string | null;
        responsible: string | null;
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
    }>>;
    update(id: string, input: UpdateDecisionInput, userRole: string): Promise<{
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
    }>;
    updateStatus(id: string, status: DecisionStatus, userRole: string): Promise<{
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
    }>;
    delete(id: string, userRole: string): Promise<{
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
    }>;
};
//# sourceMappingURL=decisions.service.d.ts.map