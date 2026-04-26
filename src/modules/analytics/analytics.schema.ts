import { z } from 'zod';

export const globalAnalysisSchema = z.object({
  title:        z.string().min(3).max(200),
  campusId:     z.string().uuid().optional(),
  classId:      z.string().uuid().optional(),
  professorId:  z.string().uuid().optional(),
  moduleId:     z.string().uuid().optional(),
  startDate:    z.string().datetime().optional(),
  endDate:      z.string().datetime().optional(),
  includeReports: z.boolean().default(true),
  includeEvaluations: z.boolean().default(true),
  periodic: z.boolean().optional(),
});

export type GlobalAnalysisInput = z.infer<typeof globalAnalysisSchema>;
