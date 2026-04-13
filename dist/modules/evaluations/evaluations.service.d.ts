import type { CreateEvaluationInput, UpdateEvaluationInput } from './evaluations.types';
export declare const evaluationsService: {
    create(input: CreateEvaluationInput, userId?: string): Promise<{
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        };
        professor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string | null;
            email: string;
            firstName: string;
            lastName: string;
            userId: string | null;
        };
        module: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
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
    }>;
    getById(id: string): Promise<{
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
            status: import("@prisma/client").$Enums.DecisionStatus;
            dueDate: Date | null;
            priority: import("@prisma/client").$Enums.Priority;
            evaluationId: string;
            deciderId: string;
            rationale: string | null;
            responsible: string | null;
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
        } | null;
    } & {
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
    }>;
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
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
    }>>;
    update(id: string, input: UpdateEvaluationInput, userId: string, userRole: string): Promise<{
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
    }>;
    delete(id: string, userRole: string): Promise<{
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
    }>;
    getStats(query: Record<string, unknown>): Promise<import("./evaluations.types").EvaluationStats>;
    triggerAiScoring(id: string, userRole: string): Promise<{
        queued: boolean;
        evaluationId: string;
    }>;
};
//# sourceMappingURL=evaluations.service.d.ts.map