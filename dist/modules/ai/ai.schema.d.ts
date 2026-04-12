import { z } from 'zod';
export declare const chatSchema: z.ZodObject<{
    question: z.ZodString;
}, z.core.$strip>;
export declare const synthesisSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const aiJobParamsSchema: z.ZodObject<{
    jobId: z.ZodString;
}, z.core.$strip>;
export declare const aiJobQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    status: z.ZodOptional<z.ZodEnum<{
        QUEUED: "QUEUED";
        PROCESSING: "PROCESSING";
        DONE: "DONE";
        FAILED: "FAILED";
    }>>;
    jobType: z.ZodOptional<z.ZodString>;
    reportId: z.ZodOptional<z.ZodString>;
    evaluationId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ChatSchema = z.infer<typeof chatSchema>;
export type SynthesisSchema = z.infer<typeof synthesisSchema>;
//# sourceMappingURL=ai.schema.d.ts.map