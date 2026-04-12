import { z } from 'zod';
import { AiJobStatus } from '@prisma/client';

export const chatSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters').max(1000),
});

export const synthesisSchema = z.object({
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate:   z.string().datetime({ offset: true }).optional(),
});

export const aiJobParamsSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
});

export const aiJobQuerySchema = z.object({
  page:        z.coerce.number().min(1).optional(),
  limit:       z.coerce.number().min(1).max(100).optional(),
  status:      z.nativeEnum(AiJobStatus).optional(),
  jobType:     z.string().optional(),
  reportId:    z.string().uuid().optional(),
  evaluationId: z.string().uuid().optional(),
});

export type ChatSchema     = z.infer<typeof chatSchema>;
export type SynthesisSchema = z.infer<typeof synthesisSchema>;
