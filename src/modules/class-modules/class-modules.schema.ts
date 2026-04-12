import { z } from 'zod';

export const createAssignmentSchema = z.object({
  classId: z.string().uuid(),
  moduleId: z.string().uuid(),
  professorIds: z.array(z.string().uuid()).optional(),
});

export const updateAssignmentSchema = z.object({
  professorIds: z.array(z.string().uuid()).optional(),
});

export const assignmentParamsSchema = z.object({
  id: z.string().uuid(),
});

export const assignmentQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  moduleId: z.string().uuid().optional(),
});
