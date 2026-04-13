import { z } from 'zod';
export declare const createSchoolSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    adminEmail: z.ZodString;
    adminPassword: z.ZodString;
    adminFirstName: z.ZodString;
    adminLastName: z.ZodString;
    matricule: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
//# sourceMappingURL=saas.schema.d.ts.map