import { z } from 'zod';
export declare const createLevelSchema: z.ZodObject<{
    name: z.ZodString;
    order: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateLevelSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const levelParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=levels.schema.d.ts.map