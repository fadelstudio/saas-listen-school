import { AiJobStatus, Prisma } from '@prisma/client';
import { AiJobFilters } from './ai.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const aiRepository: {
    createJob(data: {
        jobType: string;
        status: AiJobStatus;
        payload: Prisma.InputJsonObject;
        reportId?: string | null;
        evaluationId?: string | null;
        decisionId?: string | null;
        errorMessage?: string | null;
    }): Promise<{
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
    }>;
    findJobById(id: string, schoolId?: string | null): Promise<{
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
    } | null>;
    findJobs(filters: AiJobFilters, pagination: PaginationArgs, schoolId?: string | null): Promise<{
        items: {
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
        total: number;
    }>;
    updateJobStatus(id: string, status: AiJobStatus, result?: Prisma.InputJsonObject, errorMessage?: string): Promise<{
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
    }>;
};
export {};
//# sourceMappingURL=ai.repository.d.ts.map