import { z } from 'zod';
export declare const createDecisionSchema: z.ZodObject<{
    evaluationId: z.ZodString;
    title: z.ZodString;
    rationale: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        CRITICAL: "CRITICAL";
    }>>;
    responsible: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateDecisionSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    rationale: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        CRITICAL: "CRITICAL";
    }>>;
    responsible: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateDecisionStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        IN_PROGRESS: "IN_PROGRESS";
        PROPOSED: "PROPOSED";
        DONE: "DONE";
    }>;
}, z.core.$strip>;
export declare const decisionParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const decisionQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        IN_PROGRESS: "IN_PROGRESS";
        PROPOSED: "PROPOSED";
        DONE: "DONE";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        CRITICAL: "CRITICAL";
    }>>;
    deciderId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateDecisionSchema = z.infer<typeof createDecisionSchema>;
export type UpdateDecisionSchema = z.infer<typeof updateDecisionSchema>;
//# sourceMappingURL=decisions.schema.d.ts.map