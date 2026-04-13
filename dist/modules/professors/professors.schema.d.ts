import { z } from 'zod';
export declare const createProfessorSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateProfessorSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const professorParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const professorQuerySchema: z.ZodObject<{
    campusId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=professors.schema.d.ts.map