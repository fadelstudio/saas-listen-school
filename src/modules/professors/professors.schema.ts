import { z } from 'zod';

export const createProfessorSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  userId: z.string().uuid().optional(),
});

export const updateProfessorSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  userId: z.string().uuid().optional(),
});

export const professorParamsSchema = z.object({
  id: z.string().uuid(),
});

export const professorQuerySchema = z.object({
  campusId: z.string().uuid().optional(),
  search: z.string().optional(),
});
