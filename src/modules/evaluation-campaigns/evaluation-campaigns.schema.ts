import { z } from 'zod';

export const evaluationCampaignIdParamsSchema = z.object({
  id: z.string().uuid('Invalid campaign id'),
});

export const createEvaluationCampaignSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  classId: z.string().uuid(),
  moduleId: z.string().uuid(),
  professorId: z.string().uuid(),
  dueDate: z.string().datetime({ offset: true }).optional(),
});

export const evaluationCampaignQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  classId: z.string().uuid().optional(),
  status: z.string().optional(),
});

export type CreateEvaluationCampaignInput = z.infer<typeof createEvaluationCampaignSchema>;
export type EvaluationCampaignQuery = z.infer<typeof evaluationCampaignQuerySchema>;
