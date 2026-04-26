import { ChatInput, SynthesisInput } from './ai.types';
import { Prisma } from '@prisma/client';
export declare const aiService: {
    getJobById(jobId: string, schoolId?: string | null): Promise<{
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
    getJobs(query: Record<string, unknown>, schoolId?: string | null): Promise<import("../../utils/pagination").PaginatedResult<{
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
    getJobResult(jobId: string, schoolId?: string | null): Promise<{
        status: import("@prisma/client").$Enums.AiJobStatus;
        result: Prisma.JsonValue;
        errorMessage: string | null;
    }>;
    retryJob(jobId: string, userRole: string, schoolId?: string | null): Promise<{
        retried: boolean;
        jobId: string;
        reason?: undefined;
    } | {
        retried: boolean;
        jobId: string;
        reason: string;
    }>;
    chat(input: ChatInput, userId: string, schoolId: string): Promise<{
        queued: boolean;
        jobId: string | undefined;
        conversationId: string | undefined;
        message: string;
        reason?: undefined;
    } | {
        queued: boolean;
        jobId: string;
        conversationId: string | undefined;
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