import { ReportStatus } from '@prisma/client';
import { PaginatedResult } from '../../utils/pagination';

// ─── Enums locaux (miroir Prisma pour commodity) ──────────────────────────────

export type ReportType =
  | 'PROBLEM_MATERIAL'
  | 'PROBLEM_ADMIN'
  | 'PROBLEM_PEDAGOGICAL'
  | 'INCIDENT'
  | 'SUGGESTION'
  | 'OTHER';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ─── Inputs ───────────────────────────────────────────────────────────────────

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
  deviceMetadata?: any;
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

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface ReportFilters {
  status?: ReportStatus;
  authorId?: string;
  classId?: string;
  professorId?: string;
  moduleId?: string;
  priority?: Priority;
  isAnonymous?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ─── Output ───────────────────────────────────────────────────────────────────

export type PaginatedReports = PaginatedResult<Record<string, unknown>>;
