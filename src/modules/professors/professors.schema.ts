import { z } from 'zod';



const profileFields = {
  matricule: z.union([z.string().max(120), z.literal(''), z.null()]).optional(),
  numero: z.union([z.string().max(120), z.literal(''), z.null()]).optional(),
  phone: z.union([z.string().max(40), z.literal(''), z.null()]).optional(),
};

export const createProfessorSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  userId: z.string().uuid().optional(),
  password: z.string().min(8).optional(),
  ...profileFields,
});

export const updateProfessorSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  userId: z.string().uuid().optional(),
  ...profileFields,
});

export const professorParamsSchema = z.object({
  id: z.string().uuid(),
});

export const professorQuerySchema = z.object({
  search: z.string().optional(),
  classId: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
});

