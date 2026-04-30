import { z } from 'zod';
import { ReportStatus } from '@prisma/client';

const reportTypeEnum = z.enum([
  'PROBLEM_MATERIAL',
  'PROBLEM_ADMIN',
  'PROBLEM_PEDAGOGICAL',
  'INCIDENT',
  'SUGGESTION',
  'OTHER',
]);

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

// ─── Create ───────────────────────────────────────────────────────────────────

export const createReportSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000),
  type: reportTypeEnum,
  category: z.string().max(100).optional(),
  priority: priorityEnum,
  isAnonymous: z.boolean().optional().default(false),
  classId: z.string().uuid('Invalid class ID').optional().nullable(),
  professorId: z.string().uuid('Invalid professor ID').optional().nullable(),
  moduleId: z.string().uuid('Invalid module ID').optional().nullable(),
  uti: z.string().optional().nullable(),
});



// ─── Update ───────────────────────────────────────────────────────────────────

export const updateReportSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).max(5000).optional(),
  type: reportTypeEnum.optional(),
  category: z.string().max(100).optional(),
  priority: priorityEnum.optional(),
});

// ─── Update Status ────────────────────────────────────────────────────────────

export const updateReportStatusSchema = z.object({
  status: z.nativeEnum(ReportStatus),
});

// ─── Params ───────────────────────────────────────────────────────────────────

export const reportParamsSchema = z.object({
  id: z.string().uuid('Invalid report ID'),
});

// ─── Query (list + filters) ───────────────────────────────────────────────────

export const reportQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(ReportStatus).optional(),
  priority: priorityEnum.optional(),
  isAnonymous: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  search: z.string().max(200).optional(),
});

// ─── Exported Types ───────────────────────────────────────────────────────────

export type CreateReportSchema = z.infer<typeof createReportSchema>;
export type UpdateReportSchema = z.infer<typeof updateReportSchema>;
export type ReportQuerySchema = z.infer<typeof reportQuerySchema>;
