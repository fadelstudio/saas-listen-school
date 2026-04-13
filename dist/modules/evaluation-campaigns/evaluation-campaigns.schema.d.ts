import { z } from 'zod';
export declare const evaluationCampaignIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const createEvaluationCampaignSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    classId: z.ZodString;
    moduleId: z.ZodString;
    professorId: z.ZodString;
    dueDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const evaluationCampaignQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    classId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateEvaluationCampaignInput = z.infer<typeof createEvaluationCampaignSchema>;
export type EvaluationCampaignQuery = z.infer<typeof evaluationCampaignQuerySchema>;
//# sourceMappingURL=evaluation-campaigns.schema.d.ts.map