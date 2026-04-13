import { ChatInput, SynthesisInput } from './ai.types';
import { Prisma } from '@prisma/client';
export declare const aiService: {
    getJobById(jobId: string): Promise<{
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
    getJobs(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
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
    }>>;
    getJobResult(jobId: string): Promise<{
        status: import("@prisma/client").$Enums.AiJobStatus;
        result: Prisma.JsonValue;
        errorMessage: string | null;
    }>;
    retryJob(jobId: string, userRole: string): Promise<{
        retried: boolean;
        jobId: string;
        reason?: undefined;
    } | {
        retried: boolean;
        jobId: string;
        reason: string;
    }>;
    chat(input: ChatInput, userId: string): Promise<{
        queued: boolean;
        jobId: string | undefined;
        message: string;
        reason?: undefined;
    } | {
        queued: boolean;
        jobId: string;
        reason: string;
        message?: undefined;
    }>;
    generateSynthesis(input: SynthesisInput, userRole: string): Promise<{
        queued: boolean;
        jobId: string | undefined;
        message: string;
        reason?: undefined;
    } | {
        queued: boolean;
        jobId: string;
        reason: string;
        message?: undefined;
    }>;
};
//# sourceMappingURL=ai.service.d.ts.map