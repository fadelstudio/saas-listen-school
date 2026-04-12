import { ReportStatus } from '@prisma/client';
import type { CreateReportInput, UpdateReportInput } from './reports.types';
export declare const reportsService: {
    create(input: CreateReportInput, userId?: string): Promise<{
        author: {
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
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }>;
    getById(id: string): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }>;
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }>>;
    update(id: string, input: UpdateReportInput, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }>;
    updateStatus(id: string, status: ReportStatus, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }>;
    delete(id: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }>;
    triggerAiAnalysis(id: string, userRole: string): Promise<{
        queued: boolean;
        reportId: string;
    }>;
};
//# sourceMappingURL=reports.service.d.ts.map