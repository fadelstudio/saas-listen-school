import { z } from 'zod';
export declare const createClassSchema: z.ZodObject<{
    name: z.ZodString;
    levelId: z.ZodString;
    campusId: z.ZodString;
}, z.core.$strip>;
export declare const updateClassSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    levelId: z.ZodOptional<z.ZodString>;
    campusId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const classParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const classQuerySchema: z.ZodObject<{
    campusId: z.ZodOptional<z.ZodString>;
    levelId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=classes.schema.d.ts.map