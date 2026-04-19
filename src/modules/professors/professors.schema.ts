import { z } from 'zod';

/** Chaîne vide JSON → null (tous les campus). */
const campusIdOptional = z.preprocess(
  (v) => (v === '' ? null : v),
  z.union([z.string().uuid(), z.null()]).optional(),
);

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
  /** Si absent ou null : accès à tous les campus de l’école. */
  campusId: campusIdOptional,
  ...profileFields,
});

export const updateProfessorSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  userId: z.string().uuid().optional(),
  campusId: campusIdOptional,
  ...profileFields,
});

export const professorParamsSchema = z.object({
  id: z.string().uuid(),
});

export const professorQuerySchema = z.object({
  campusId: z.string().uuid().optional(),
  search: z.string().optional(),
});
