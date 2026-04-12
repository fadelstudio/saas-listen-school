import { z } from 'zod';
export declare const createEvaluationSchema: z.ZodObject<{
    reportId: z.ZodOptional<z.ZodString>;
    score: z.ZodOptional<z.ZodNumber>;
    clarityScore: z.ZodOptional<z.ZodNumber>;
    pedagogyScore: z.ZodOptional<z.ZodNumber>;
    availabilityScore: z.ZodOptional<z.ZodNumber>;
    rhythmScore: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateEvaluationSchema: z.ZodObject<{
    score: z.ZodOptional<z.ZodNumber>;
    clarityScore: z.ZodOptional<z.ZodNumber>;
    pedagogyScore: z.ZodOptional<z.ZodNumber>;
    availabilityScore: z.ZodOptional<z.ZodNumber>;
    rhythmScore: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const evaluationParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const evaluationQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
    }>>;
    evaluatorId: z.ZodOptional<z.ZodString>;
    reportId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateEvaluationSchema = z.infer<typeof createEvaluationSchema>;
export type UpdateEvaluationSchema = z.infer<typeof updateEvaluationSchema>;
//# sourceMappingURL=evaluations.schema.d.ts.map