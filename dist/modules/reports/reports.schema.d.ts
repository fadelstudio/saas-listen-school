import { z } from 'zod';
export declare const createReportSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    type: z.ZodEnum<{
        PROBLEM_MATERIAL: "PROBLEM_MATERIAL";
        PROBLEM_ADMIN: "PROBLEM_ADMIN";
        PROBLEM_PEDAGOGICAL: "PROBLEM_PEDAGOGICAL";
        INCIDENT: "INCIDENT";
        SUGGESTION: "SUGGESTION";
        OTHER: "OTHER";
    }>;
    category: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        CRITICAL: "CRITICAL";
    }>;
    isAnonymous: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    classId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    professorId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    moduleId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    uti: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateReportSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        PROBLEM_MATERIAL: "PROBLEM_MATERIAL";
        PROBLEM_ADMIN: "PROBLEM_ADMIN";
        PROBLEM_PEDAGOGICAL: "PROBLEM_PEDAGOGICAL";
        INCIDENT: "INCIDENT";
        SUGGESTION: "SUGGESTION";
        OTHER: "OTHER";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        CRITICAL: "CRITICAL";
    }>>;
}, z.core.$strip>;
export declare const updateReportStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        DRAFT: "DRAFT";
        SUBMITTED: "SUBMITTED";
        REVIEWED: "REVIEWED";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>;
}, z.core.$strip>;
export declare const reportParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const reportQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        SUBMITTED: "SUBMITTED";
        REVIEWED: "REVIEWED";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        CRITICAL: "CRITICAL";
    }>>;
    isAnonymous: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateReportSchema = z.infer<typeof createReportSchema>;
export type UpdateReportSchema = z.infer<typeof updateReportSchema>;
export type ReportQuerySchema = z.infer<typeof reportQuerySchema>;
//# sourceMappingURL=reports.schema.d.ts.map