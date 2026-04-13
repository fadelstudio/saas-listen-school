import { ReportStatus } from '@prisma/client';
import type { CreateReportInput, UpdateReportInput } from './reports.types';
export declare const reportsService: {
    create(input: CreateReportInput, userId?: string): Promise<{
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        } | null;
        professor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string | null;
            email: string;
            firstName: string;
            lastName: string;
            userId: string | null;
        } | null;
        module: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
        } | null;
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.ReportType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    getById(id: string): Promise<{
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        } | null;
        professor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string | null;
            email: string;
            firstName: string;
            lastName: string;
            userId: string | null;
        } | null;
        module: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
        } | null;
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
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
    } & {
        type: import("@prisma/client").$Enums.ReportType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        } | null;
        professor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string | null;
            email: string;
            firstName: string;
            lastName: string;
            userId: string | null;
        } | null;
        module: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
        } | null;
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.ReportType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>>;
    update(id: string, input: UpdateReportInput, userId: string, userRole: string): Promise<{
        type: import("@prisma/client").$Enums.ReportType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    updateStatus(id: string, status: ReportStatus, userRole: string): Promise<{
        type: import("@prisma/client").$Enums.ReportType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    delete(id: string, userRole: string): Promise<{
        type: import("@prisma/client").$Enums.ReportType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    triggerAiAnalysis(id: string, userRole: string): Promise<{
        queued: boolean;
        reportId: string;
    }>;
};
//# sourceMappingURL=reports.service.d.ts.map