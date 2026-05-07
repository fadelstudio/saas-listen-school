import { z } from 'zod';
export declare const createEvaluationSchema: z.ZodObject<{
    comment: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    uti: z.ZodOptional<z.ZodString>;
    campaignId: z.ZodOptional<z.ZodString>;
    comprehensionRating: z.ZodEnum<{
        VERY_POOR: "VERY_POOR";
        POOR: "POOR";
        FAIR: "FAIR";
        GOOD: "GOOD";
        EXCELLENT: "EXCELLENT";
    }>;
    explanationRating: z.ZodEnum<{
        VERY_POOR: "VERY_POOR";
        POOR: "POOR";
        FAIR: "FAIR";
        GOOD: "GOOD";
        EXCELLENT: "EXCELLENT";
    }>;
    pedagogyRating: z.ZodEnum<{
        VERY_POOR: "VERY_POOR";
        POOR: "POOR";
        FAIR: "FAIR";
        GOOD: "GOOD";
        EXCELLENT: "EXCELLENT";
    }>;
    availabilityRating: z.ZodEnum<{
        VERY_POOR: "VERY_POOR";
        POOR: "POOR";
        FAIR: "FAIR";
        GOOD: "GOOD";
        EXCELLENT: "EXCELLENT";
    }>;
    rhythmRating: z.ZodEnum<{
        VERY_POOR: "VERY_POOR";
        POOR: "POOR";
        FAIR: "FAIR";
        GOOD: "GOOD";
        EXCELLENT: "EXCELLENT";
    }>;
    reportId: z.ZodOptional<z.ZodString>;
    professorId: z.ZodString;
    moduleId: z.ZodString;
    classId: z.ZodString;
}, z.core.$strip>;
export declare const updateEvaluationSchema: z.ZodObject<{
    comprehensionRating: z.ZodOptional<z.ZodEnum<{
        VERY_POOR: "VERY_POOR";
        POOR: "POOR";
        FAIR: "FAIR";
        GOOD: "GOOD";
        EXCELLENT: "EXCELLENT";
    }>>;
    explanationRating: z.ZodOptional<z.ZodEnum<{
        VERY_POOR: "VERY_POOR";
        POOR: "POOR";
        FAIR: "FAIR";
        GOOD: "GOOD";
        EXCELLENT: "EXCELLENT";
    }>>;
    pedagogyRating: z.ZodOptional<z.ZodEnum<{
        VERY_POOR: "VERY_POOR";
        POOR: "POOR";
        FAIR: "FAIR";
        GOOD: "GOOD";
        EXCELLENT: "EXCELLENT";
    }>>;
    availabilityRating: z.ZodOptional<z.ZodEnum<{
        VERY_POOR: "VERY_POOR";
        POOR: "POOR";
        FAIR: "FAIR";
        GOOD: "GOOD";
        EXCELLENT: "EXCELLENT";
    }>>;
    rhythmRating: z.ZodOptional<z.ZodEnum<{
        VERY_POOR: "VERY_POOR";
        POOR: "POOR";
        FAIR: "FAIR";
        GOOD: "GOOD";
        EXCELLENT: "EXCELLENT";
    }>>;
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