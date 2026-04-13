import { ReportStatus, Prisma } from '@prisma/client';
import { CreateReportInput, UpdateReportInput, ReportFilters } from './reports.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const reportsRepository: {
    getUserContext(userId: string): Promise<{
        campusId: string | null;
        classId: string | null;
    } | null>;
    create(data: CreateReportInput, authorId?: string): Promise<{
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }>;
    findById(id: string): Promise<({
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }) | null>;
    findAll(filters: ReportFilters, pagination: PaginationArgs): Promise<{
        items: ({
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
            attachments: Prisma.JsonValue | null;
            deviceMetadata: Prisma.JsonValue | null;
            aiAnalysis: Prisma.JsonValue | null;
        })[];
        total: number;
    }>;
    update(id: string, data: UpdateReportInput): Promise<{
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }>;
    updateStatus(id: string, status: ReportStatus): Promise<{
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }>;
    updateAiAnalysis(id: string, aiAnalysis: string): Promise<{
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }>;
    delete(id: string): Promise<{
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }>;
    existsById(id: string): Promise<boolean>;
};
export {};
//# sourceMappingURL=reports.repository.d.ts.map