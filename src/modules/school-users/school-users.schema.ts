import { z } from 'zod';
import { idStringSchema } from '../../utils/idSchema';

export const createSchoolUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['MANAGER', 'AGENT', 'VIEWER', 'STUDENT']),
  matricule: z.string().min(1).max(50).optional(),
  classId: idStringSchema.optional(),
});

export const updateSchoolUserSchema = z.object({
  role: z.enum(['MANAGER', 'AGENT', 'VIEWER', 'STUDENT']).optional(),
  isActive: z.boolean().optional(),
  classId: z.union([idStringSchema, z.null()]).optional(),
});

export const schoolUserParamsSchema = z.object({
  id: idStringSchema,
});

export const schoolUserQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT', 'VIEWER', 'STUDENT']).optional(),
  campusId: idStringSchema.optional(),
  classId: idStringSchema.optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});
