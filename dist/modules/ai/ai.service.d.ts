import { ChatInput, SynthesisInput } from './ai.types';
export declare const aiService: {
    getJobById(jobId: string): Promise<{
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
    }>;
    getJobs(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
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
    }>>;
    getJobResult(jobId: string): Promise<{
        status: import("@prisma/client").$Enums.AiJobStatus;
        result: import("@prisma/client/runtime/client").JsonValue;
        errorMessage: string | null;
    }>;
    retryJob(jobId: string, userRole: string): Promise<{
        retried: boolean;
        jobId: string;
    }>;
    chat(input: ChatInput, userId: string): Promise<{
        jobId: string | undefined;
        message: string;
    }>;
    generateSynthesis(input: SynthesisInput, userRole: string): Promise<{
        jobId: string | undefined;
        message: string;
    }>;
};
//# sourceMappingURL=ai.service.d.ts.map