import { ReportStatus, Prisma } from '@prisma/client';
import { CreateReportInput, UpdateReportInput, ReportFilters } from './reports.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const reportsRepository: {
    create(data: CreateReportInput, authorId?: string): Promise<{
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
    findById(id: string): Promise<({
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }) | null>;
    findAll(filters: ReportFilters, pagination: PaginationArgs): Promise<{
        items: ({
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
        })[];
        total: number;
    }>;
    update(id: string, data: UpdateReportInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }>;
    updateStatus(id: string, status: ReportStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }>;
    updateAiAnalysis(id: string, aiAnalysis: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        authorId: string;
        aiAnalysis: string | null;
    }>;
    existsById(id: string): Promise<boolean>;
};
export {};
//# sourceMappingURL=reports.repository.d.ts.map