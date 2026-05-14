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
  uti?: string; // Short for targetDeviceUti
  deviceMetadata?: Record<string, unknown>;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size?: number;
    duration?: number;
  }[];
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
  campusId?: string;
  campusIds?: string[];
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
