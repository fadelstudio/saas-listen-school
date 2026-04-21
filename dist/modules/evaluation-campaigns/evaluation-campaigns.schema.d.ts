import { z } from 'zod';
export declare const evaluationCampaignIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const createEvaluationCampaignSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    scope: z.ZodDefault<z.ZodEnum<{
        CLASS: "CLASS";
        CAMPUS: "CAMPUS";
        SCHOOL: "SCHOOL";
    }>>;
    classId: z.ZodOptional<z.ZodString>;
    campusId: z.ZodOptional<z.ZodString>;
    moduleId: z.ZodOptional<z.ZodString>;
    professorId: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodString;
}, z.core.$strip>;
export declare const evaluationCampaignQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    classId: z.ZodOptional<z.ZodString>;
    campusId: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodEnum<{
        CLASS: "CLASS";
        CAMPUS: "CAMPUS";
        SCHOOL: "SCHOOL";
    }>>;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateEvaluationCampaignInput = z.infer<typeof createEvaluationCampaignSchema>;
export type EvaluationCampaignQuery = z.infer<typeof evaluationCampaignQuerySchema>;
//# sourceMappingURL=evaluation-campaigns.schema.d.ts.map