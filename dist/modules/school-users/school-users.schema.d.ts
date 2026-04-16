import { z } from 'zod';
export declare const createSchoolUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<{
        MANAGER: "MANAGER";
        AGENT: "AGENT";
        STUDENT: "STUDENT";
        VIEWER: "VIEWER";
    }>;
    matricule: z.ZodOptional<z.ZodString>;
    classId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateSchoolUserSchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<{
        MANAGER: "MANAGER";
        AGENT: "AGENT";
        STUDENT: "STUDENT";
        VIEWER: "VIEWER";
    }>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    classId: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
}, z.core.$strip>;
export declare const schoolUserParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const schoolUserQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    role: z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        MANAGER: "MANAGER";
        AGENT: "AGENT";
        STUDENT: "STUDENT";
        VIEWER: "VIEWER";
    }>>;
    campusId: z.ZodOptional<z.ZodString>;
    classId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=school-users.schema.d.ts.map