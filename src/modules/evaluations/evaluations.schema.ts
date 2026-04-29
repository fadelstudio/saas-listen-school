import { z } from 'zod';
import { EvaluationStatus, RatingBand } from '@prisma/client';
import { idStringSchema } from '../../utils/idSchema';

const ratingBandSchema = z.nativeEnum(RatingBand);

const fiveRatings = {
  comprehensionRating: ratingBandSchema,
  explanationRating: ratingBandSchema,
  pedagogyRating: ratingBandSchema,
  availabilityRating: ratingBandSchema,
  rhythmRating: ratingBandSchema,
};

export const createEvaluationSchema = z.object({
  reportId: idStringSchema.optional(),
  professorId: idStringSchema,
  moduleId: idStringSchema,
  classId: idStringSchema,
  ...fiveRatings,
  comment: z.string().max(2000).optional(),
  isAnonymous: z.boolean().optional().default(false),
  uti: z.string().optional(),
  campaignId: idStringSchema.optional(),

});

export const updateEvaluationSchema = z.object({
  comprehensionRating: ratingBandSchema.optional(),
  explanationRating: ratingBandSchema.optional(),
  pedagogyRating: ratingBandSchema.optional(),
  availabilityRating: ratingBandSchema.optional(),
  rhythmRating: ratingBandSchema.optional(),
  comment: z.string().max(2000).optional(),
});

export const evaluationParamsSchema = z.object({
  id: idStringSchema,
});

export const evaluationQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(EvaluationStatus).optional(),
  evaluatorId: idStringSchema.optional(),
  reportId: idStringSchema.optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
});

export type CreateEvaluationSchema = z.infer<typeof createEvaluationSchema>;
export type UpdateEvaluationSchema = z.infer<typeof updateEvaluationSchema>;
