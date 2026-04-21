import { z } from 'zod';
import { idStringSchema } from '../../utils/idSchema';

/** Chaîne vide / null → ignoré (ex. campus vide = tous les campus pour le staff). */
const optionalId = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  idStringSchema.optional(),
);

export const createSchoolUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT', 'VIEWER', 'STUDENT', 'PROFESSOR']),
  matricule: z.string().min(1).max(50).optional(),
  numero: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  /**
   * Optionnel. Pour MANAGER / AGENT / VIEWER : si omis ou vide → `campusId` null
   * (périmètre toute l’école, comme un admin école sans campus).
   * Pour STUDENT : utiliser `classId` (le campus est déduit de la classe).
   */
  campusIds: z.array(idStringSchema).optional(),
  classId: optionalId,
});

export const updateSchoolUserSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT', 'VIEWER', 'STUDENT', 'PROFESSOR']).optional(),
  isActive: z.boolean().optional(),
  classId: z.union([idStringSchema, z.null()]).optional(),
  campusIds: z.array(idStringSchema).optional(),
});

export const schoolUserParamsSchema = z.object({
  id: idStringSchema,
});

export const schoolUserQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT', 'VIEWER', 'STUDENT', 'PROFESSOR']).optional(),
  campusId: optionalId,
  classId: optionalId,
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});
