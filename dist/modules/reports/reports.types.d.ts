import { ReportStatus } from '@prisma/client';
import { PaginatedResult } from '../../utils/pagination';
export type ReportType = 'PROBLEM_MATERIAL' | 'PROBLEM_ADMIN' | 'PROBLEM_PEDAGOGICAL' | 'INCIDENT' | 'SUGGESTION' | 'OTHER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface CreateReportInput {
    title: string;
    content: string;
    type?: ReportType;
    category?: string;
    priority?: Priority;
    isAnonymous?: boolean;
    classId?: string;
    professorId?: string;
    moduleId?: string;
    deviceMetadata?: Record<string, unknown>;
}
export interface UpdateReportInput {
    title?: string;
    content?: string;
    type?: ReportType;
    category?: string;
    priority?: Priority;
}
export interface UpdateReportStatusInput {
    status: ReportStatus;
}
export interface ReportFilters {
    status?: ReportStatus;
    authorId?: string;
    campusId?: string;
    classId?: string;
    professorId?: string;
    moduleId?: string;
    priority?: Priority;
    isAnonymous?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
}
export type PaginatedReports = PaginatedResult<Record<string, unknown>>;
//# sourceMappingURL=reports.types.d.ts.map