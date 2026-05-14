import { z } from 'zod';
export declare const createAnnouncementSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateAnnouncementSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    imageUrl: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, z.core.$strip>;
export declare const announcementParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=announcements.schema.d.ts.map