import { z } from 'zod';

export const createCampusSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().max(200).optional(),
});

export const updateCampusSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  location: z.string().max(200).optional(),
});

export const campusParamsSchema = z.object({
  id: z.string().uuid(),
});
