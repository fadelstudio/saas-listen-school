import { z } from 'zod';

export const createLevelSchema = z.object({
  name: z.string().min(1).max(100),
  order: z.number().int().optional(),
});

export const updateLevelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order: z.number().int().optional(),
});

export const levelParamsSchema = z.object({
  id: z.string().uuid(),
});
