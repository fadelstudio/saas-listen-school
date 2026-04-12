import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(2).max(100),
  levelId: z.string().uuid(),
  campusId: z.string().uuid(),
});

export const updateClassSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  levelId: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
});

export const classParamsSchema = z.object({
  id: z.string().uuid(),
});

export const classQuerySchema = z.object({
  campusId: z.string().uuid().optional(),
  levelId:  z.string().uuid().optional(),
  search:   z.string().optional(),
});
