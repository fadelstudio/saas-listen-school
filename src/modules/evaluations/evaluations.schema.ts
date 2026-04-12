import { z } from 'zod';
import { EvaluationStatus } from '@prisma/client';

const scoreField = (label: string) =>
  z.number().min(0, `${label} min 0`).max(20, `${label} max 20`).optional();

export const createEvaluationSchema = z.object({
  reportId:          z.string().uuid('Invalid report ID').optional(),
  professorId:       z.string().uuid('Invalid professor ID'),
  moduleId:          z.string().uuid('Invalid module ID'),
  classId:           z.string().uuid('Invalid class ID'),
  score:             scoreField('Score'),
  clarityScore:      z.number().min(0).max(5).optional(),
  pedagogyScore:     z.number().min(0).max(5).optional(),
  availabilityScore: z.number().min(0).max(5).optional(),
  rhythmScore:       z.number().min(0).max(5).optional(),
  comment:           z.string().max(2000).optional(),
  isAnonymous:       z.boolean().optional().default(false),
});

export const updateEvaluationSchema = z.object({
  score:             scoreField('Score'),
  clarityScore:      z.number().min(0).max(5).optional(),
  pedagogyScore:     z.number().min(0).max(5).optional(),
  availabilityScore: z.number().min(0).max(5).optional(),
  rhythmScore:       z.number().min(0).max(5).optional(),
  comment:           z.string().max(2000).optional(),
});

export const evaluationParamsSchema = z.object({
  id: z.string().uuid('Invalid evaluation ID'),
});

export const evaluationQuerySchema = z.object({
  page:        z.coerce.number().min(1).optional(),
  limit:       z.coerce.number().min(1).max(100).optional(),
  sortBy:      z.string().optional(),
  sortOrder:   z.enum(['asc', 'desc']).optional(),
  status:      z.nativeEnum(EvaluationStatus).optional(),
  evaluatorId: z.string().uuid().optional(),
  reportId:    z.string().uuid().optional(),
  startDate:   z.string().datetime({ offset: true }).optional(),
  endDate:     z.string().datetime({ offset: true }).optional(),
});

export type CreateEvaluationSchema = z.infer<typeof createEvaluationSchema>;
export type UpdateEvaluationSchema = z.infer<typeof updateEvaluationSchema>;
