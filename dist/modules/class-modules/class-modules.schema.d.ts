import { z } from 'zod';
export declare const createAssignmentSchema: z.ZodObject<{
    classId: z.ZodString;
    moduleId: z.ZodString;
    professorIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updateAssignmentSchema: z.ZodObject<{
    professorIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const assignmentParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const assignmentQuerySchema: z.ZodObject<{
    classId: z.ZodOptional<z.ZodString>;
    moduleId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=class-modules.schema.d.ts.map