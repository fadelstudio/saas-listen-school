import { z } from 'zod';
import { idStringSchema } from '../../utils/idSchema';

export const evaluationCampaignIdParamsSchema = z.object({
  id: idStringSchema,
});

export const createEvaluationCampaignSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  scope: z.enum(['CLASS', 'CAMPUS', 'SCHOOL']).default('CLASS'),
  classId: idStringSchema.optional(),
  campusId: idStringSchema.optional(),
  moduleId: idStringSchema.optional(),
  professorId: idStringSchema.optional(),
  dueDate: z.string().datetime({ offset: true }),
}).superRefine((val, ctx) => {
  if (val.scope === 'CLASS') {
    if (!val.classId) ctx.addIssue({ code: 'custom', message: 'classId is required when scope=CLASS', path: ['classId'] });
    if (!val.moduleId) ctx.addIssue({ code: 'custom', message: 'moduleId is required when scope=CLASS', path: ['moduleId'] });
    if (!val.professorId) ctx.addIssue({ code: 'custom', message: 'professorId is required when scope=CLASS', path: ['professorId'] });
  }
  if (val.scope === 'CAMPUS' && !val.campusId) {
    ctx.addIssue({ code: 'custom', message: 'campusId is required when scope=CAMPUS', path: ['campusId'] });
  }
});

export const evaluationCampaignQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  classId: idStringSchema.optional(),
  campusId: idStringSchema.optional(),
  scope: z.enum(['CLASS', 'CAMPUS', 'SCHOOL']).optional(),
  status: z.string().optional(),
});

export type CreateEvaluationCampaignInput = z.infer<typeof createEvaluationCampaignSchema>;
export type EvaluationCampaignQuery = z.infer<typeof evaluationCampaignQuerySchema>;
