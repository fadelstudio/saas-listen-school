import { z } from 'zod';
import { idStringSchema } from '../../utils/idSchema';

export const createAssignmentSchema = z.object({
  classId: idStringSchema,
  moduleId: idStringSchema,
  professorIds: z.array(idStringSchema).optional(),
});

export const updateAssignmentSchema = z.object({
  professorIds: z.array(idStringSchema).optional(),
});

export const assignmentParamsSchema = z.object({
  id: idStringSchema,
});

export const assignmentQuerySchema = z.object({
  classId: idStringSchema.optional(),
  moduleId: idStringSchema.optional(),
});
