import { DecisionStatus, Prisma } from '@prisma/client';
import { CreateDecisionInput, UpdateDecisionInput, DecisionFilters } from './decisions.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const decisionsRepository: {
    create(data: CreateDecisionInput, deciderId: string): Promise<{
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
    findById(id: string): Promise<({
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
            attachments: Prisma.JsonValue | null;
            deviceMetadata: Prisma.JsonValue | null;
            aiAnalysis: Prisma.JsonValue | null;
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
        priority: import("@prisma/client").$Enums.Priority;
        status: import("@prisma/client").$Enums.DecisionStatus;
        reportId: string | null;
        dueDate: Date | null;
        evaluationId: string | null;
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
            priority: import("@prisma/client").$Enums.Priority;
            status: import("@prisma/client").$Enums.DecisionStatus;
            reportId: string | null;
            dueDate: Date | null;
            evaluationId: string | null;
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
    updateStatus(id: string, status: DecisionStatus): Promise<{
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
    delete(id: string): Promise<{
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
    existsById(id: string): Promise<boolean>;
};
export {};
//# sourceMappingURL=decisions.repository.d.ts.map