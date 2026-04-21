import { ReportStatus } from '@prisma/client';
import type { CreateReportInput, UpdateReportInput } from './reports.types';
export declare const reportsService: {
    create(input: CreateReportInput, userId?: string, schoolId?: string | null): Promise<{
        module: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        } | null;
        professor: {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            phone: string | null;
            firstName: string;
            lastName: string;
            matricule: string | null;
            numero: string | null;
            avatarPath: string | null;
            userId: string | null;
        } | null;
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        } | null;
        author: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
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
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deviceMetadata: import("@prisma/client/runtime/client").JsonValue | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getById(id: string, userRole?: string, schoolId?: string | null): Promise<{
        module: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        } | null;
        professor: {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            phone: string | null;
            firstName: string;
            lastName: string;
            matricule: string | null;
            numero: string | null;
            avatarPath: string | null;
            userId: string | null;
        } | null;
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        } | null;
        author: {
            email: string;
            id: string;
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
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deviceMetadata: import("@prisma/client/runtime/client").JsonValue | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getAll(query: Record<string, unknown>, userRole?: string, schoolId?: string | null): Promise<import("../../utils/pagination").PaginatedResult<{
        module: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        } | null;
        professor: {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            phone: string | null;
            firstName: string;
            lastName: string;
            matricule: string | null;
            numero: string | null;
            avatarPath: string | null;
            userId: string | null;
        } | null;
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        } | null;
        author: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
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
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deviceMetadata: import("@prisma/client/runtime/client").JsonValue | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
    }>>;
    update(id: string, input: UpdateReportInput, userId: string, userRole: string, schoolId?: string | null): Promise<{
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
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deviceMetadata: import("@prisma/client/runtime/client").JsonValue | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
    } | null>;
    updateStatus(id: string, status: ReportStatus, userRole: string, schoolId?: string | null): Promise<{
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
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deviceMetadata: import("@prisma/client/runtime/client").JsonValue | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
    } | null>;
    delete(id: string, userRole: string, schoolId?: string | null): Promise<import("@prisma/client").Prisma.BatchPayload>;
    triggerAiAnalysis(id: string, userRole: string, schoolId?: string | null): Promise<{
        queued: boolean;
        reportId: string;
    }>;
};
//# sourceMappingURL=reports.service.d.ts.map