import { z } from 'zod';
export declare const globalAnalysisSchema: z.ZodObject<{
    title: z.ZodString;
    campusId: z.ZodOptional<z.ZodString>;
    classId: z.ZodOptional<z.ZodString>;
    professorId: z.ZodOptional<z.ZodString>;
    moduleId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    includeReports: z.ZodDefault<z.ZodBoolean>;
    includeEvaluations: z.ZodDefault<z.ZodBoolean>;
    periodic: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type GlobalAnalysisInput = z.infer<typeof globalAnalysisSchema>;
//# sourceMappingURL=analytics.schema.d.ts.map