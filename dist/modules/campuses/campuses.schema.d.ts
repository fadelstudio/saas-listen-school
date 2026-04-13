import { z } from 'zod';
export declare const createCampusSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateCampusSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const campusParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=campuses.schema.d.ts.map