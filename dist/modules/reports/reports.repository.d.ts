import { ReportStatus, Prisma } from '@prisma/client';
import { CreateReportInput, UpdateReportInput, ReportFilters } from './reports.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const reportsRepository: {
    getUserContext(userId: string): Promise<{
        classId: string | null;
        campuses: {
            id: string;
        }[];
    } | null>;
    create(data: CreateReportInput, authorId?: string, schoolId?: string | null): Promise<{
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
        attachments: Prisma.JsonValue | null;
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
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }>;
    findById(id: string, schoolId?: string | null): Promise<({
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
        attachments: Prisma.JsonValue | null;
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
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }) | null>;
    findAll(filters: ReportFilters, pagination: PaginationArgs, schoolId?: string | null): Promise<{
        items: ({
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
            attachments: Prisma.JsonValue | null;
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
            deviceMetadata: Prisma.JsonValue | null;
            aiAnalysis: Prisma.JsonValue | null;
        })[];
        total: number;
    }>;
    update(id: string, data: UpdateReportInput, schoolId?: string | null): Promise<{
        type: import("@prisma/client").$Enums.ReportType;
        attachments: Prisma.JsonValue | null;
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
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    } | null>;
    updateStatus(id: string, status: ReportStatus, schoolId?: string | null): Promise<{
        type: import("@prisma/client").$Enums.ReportType;
        attachments: Prisma.JsonValue | null;
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
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    } | null>;
    updateAiAnalysis(id: string, aiAnalysis: string): Promise<{
        type: import("@prisma/client").$Enums.ReportType;
        attachments: Prisma.JsonValue | null;
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
        deviceMetadata: Prisma.JsonValue | null;
        aiAnalysis: Prisma.JsonValue | null;
    }>;
    delete(id: string, schoolId?: string | null): Promise<Prisma.BatchPayload>;
    existsById(id: string, schoolId?: string | null): Promise<boolean>;
};
export {};
//# sourceMappingURL=reports.repository.d.ts.map