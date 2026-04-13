import { z } from 'zod';

export const evaluationCampaignIdParamsSchema = z.object({
  id: z.string().uuid('Invalid campaign id'),
});

export const createEvaluationCampaignSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  scope: z.enum(['CLASS', 'CAMPUS', 'SCHOOL']).default('CLASS'),
  classId: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
  moduleId: z.string().uuid(),
  professorId: z.string().uuid(),
  dueDate: z.string().datetime({ offset: true }),
}).superRefine((val, ctx) => {
  if (val.scope === 'CLASS' && !val.classId) {
    ctx.addIssue({ code: 'custom', message: 'classId is required when scope=CLASS', path: ['classId'] });
  }
  if (val.scope === 'CAMPUS' && !val.campusId) {
    ctx.addIssue({ code: 'custom', message: 'campusId is required when scope=CAMPUS', path: ['campusId'] });
  }
});

export const evaluationCampaignQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  classId: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
  scope: z.enum(['CLASS', 'CAMPUS', 'SCHOOL']).optional(),
  status: z.string().optional(),
});

export type CreateEvaluationCampaignInput = z.infer<typeof createEvaluationCampaignSchema>;
export type EvaluationCampaignQuery = z.infer<typeof evaluationCampaignQuerySchema>;
