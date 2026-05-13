import { z } from 'zod';
export declare const updateSystemSettingsSchema: z.ZodObject<{
    schoolName: z.ZodOptional<z.ZodString>;
    authReportsRequired: z.ZodOptional<z.ZodBoolean>;
    authEvaluationsRequired: z.ZodOptional<z.ZodBoolean>;
    authOtpRequired: z.ZodOptional<z.ZodBoolean>;
    aiEnabled: z.ZodOptional<z.ZodBoolean>;
    aiConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        provider: z.ZodString;
        model: z.ZodString;
        apiKey: z.ZodString;
        priority: z.ZodNumber;
        isFree: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>>;
    aiOverrideConfigId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdateSystemSettingsInput = z.infer<typeof updateSystemSettingsSchema>;
//# sourceMappingURL=system.schema.d.ts.map