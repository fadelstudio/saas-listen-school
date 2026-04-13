import { Prisma } from '@prisma/client';
import { CreateEvaluationInput, UpdateEvaluationInput, EvaluationFilters, EvaluationStats } from './evaluations.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const evaluationsRepository: {
    getUserContext(userId: string): Promise<{
        campusId: string | null;
        classId: string | null;
    } | null>;
    create(data: CreateEvaluationInput, evaluatorId?: string): Promise<{
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
    findById(id: string): Promise<({
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
    }) | null>;
    findAll(filters: EvaluationFilters, pagination: PaginationArgs): Promise<{
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
        })[];
        total: number;
    }>;
    update(id: string, data: UpdateEvaluationInput): Promise<{
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
    delete(id: string): Promise<{
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
    existsById(id: string): Promise<boolean>;
    updateAiScore(id: string, aiScore: number): Promise<{
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
    getAggregatedStats(filters: EvaluationFilters): Promise<EvaluationStats>;
};
export {};
//# sourceMappingURL=evaluations.repository.d.ts.map