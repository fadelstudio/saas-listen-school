import { z } from 'zod';

export const createAcademicModuleSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().optional(),
});

export const updateAcademicModuleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().optional(),
});

export const academicModuleParamsSchema = z.object({
  id: z.string().uuid(),
});

export const academicModuleQuerySchema = z.object({
  search: z.string().optional(),
});
