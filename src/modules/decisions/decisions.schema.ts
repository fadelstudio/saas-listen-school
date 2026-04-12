import { z } from 'zod';
import { DecisionStatus } from '@prisma/client';

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const createDecisionSchema = z.object({
  evaluationId: z.string().uuid('Invalid evaluation ID'),
  title:        z.string().min(3, 'Title must be at least 3 characters').max(200),
  rationale:    z.string().max(2000).optional(),
  priority:     priorityEnum.optional(),
  responsible:  z.string().max(100).optional(),
  dueDate:      z.string().datetime({ offset: true }).optional(),
});

export const updateDecisionSchema = z.object({
  title:       z.string().min(3).max(200).optional(),
  rationale:   z.string().max(2000).optional(),
  priority:    priorityEnum.optional(),
  responsible: z.string().max(100).optional(),
  dueDate:     z.string().datetime({ offset: true }).optional(),
});

export const updateDecisionStatusSchema = z.object({
  status: z.nativeEnum(DecisionStatus),
});

export const decisionParamsSchema = z.object({
  id: z.string().uuid('Invalid decision ID'),
});

export const decisionQuerySchema = z.object({
  page:      z.coerce.number().min(1).optional(),
  limit:     z.coerce.number().min(1).max(100).optional(),
  sortBy:    z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status:    z.nativeEnum(DecisionStatus).optional(),
  priority:  priorityEnum.optional(),
  deciderId: z.string().uuid().optional(),
});

export type CreateDecisionSchema = z.infer<typeof createDecisionSchema>;
export type UpdateDecisionSchema = z.infer<typeof updateDecisionSchema>;
