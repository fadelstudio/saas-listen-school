import { ReportStatus, Prisma } from '@prisma/client';
import { CreateReportInput, UpdateReportInput, ReportFilters } from './reports.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const reportsRepository: {
    getUserContext(userId: string): Promise<{
        campusId: string | null;
        classId: string | null;
    } | null>;
    create(data: CreateReportInput, authorId?: string, schoolId?: string | null): Promise<{
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string;
            levelId: string;
        } | null;
        module: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
        } | null;
        professor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            campusId: string | null;
            userId: string | null;
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }>;
    findById(id: string, schoolId?: string | null): Promise<({
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string;
            levelId: string;
        } | null;
        module: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
        } | null;
        professor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            campusId: string | null;
            userId: string | null;
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }) | null>;
    findAll(filters: ReportFilters, pagination: PaginationArgs, schoolId?: string | null): Promise<{
        items: ({
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                campusId: string;
                levelId: string;
            } | null;
            module: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
            } | null;
            professor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                firstName: string;
                lastName: string;
                campusId: string | null;
                userId: string | null;
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
            attachments: Prisma.JsonValue | null;
            deviceMetadata: Prisma.JsonValue | null;
            aiAnalysis: Prisma.JsonValue | null;
        })[];
        total: number;
    }>;
    update(id: string, data: UpdateReportInput, schoolId?: string | null): Promise<{
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    } | null>;
    updateStatus(id: string, status: ReportStatus, schoolId?: string | null): Promise<{
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    } | null>;
    updateAiAnalysis(id: string, aiAnalysis: string): Promise<{
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
        attachments: Prisma.JsonValue | null;
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }>;
    delete(id: string, schoolId?: string | null): Promise<Prisma.BatchPayload>;
    existsById(id: string, schoolId?: string | null): Promise<boolean>;
};
export {};
//# sourceMappingURL=reports.repository.d.ts.map