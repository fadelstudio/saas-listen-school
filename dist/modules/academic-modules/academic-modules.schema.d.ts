import { z } from 'zod';
export declare const createAcademicModuleSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateAcademicModuleSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const academicModuleParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const academicModuleQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=academic-modules.schema.d.ts.map