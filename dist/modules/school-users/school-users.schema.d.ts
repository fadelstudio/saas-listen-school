import { z } from 'zod';
export declare const createSchoolUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        MANAGER: "MANAGER";
        AGENT: "AGENT";
        STUDENT: "STUDENT";
        VIEWER: "VIEWER";
        PROFESSOR: "PROFESSOR";
    }>;
    matricule: z.ZodOptional<z.ZodString>;
    numero: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    campusIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    classId: z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateSchoolUserSchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        MANAGER: "MANAGER";
        AGENT: "AGENT";
        STUDENT: "STUDENT";
        VIEWER: "VIEWER";
        PROFESSOR: "PROFESSOR";
    }>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    classId: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
    campusIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
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
        PROFESSOR: "PROFESSOR";
    }>>;
    campusId: z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodString>>;
    classId: z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodString>>;
    search: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=school-users.schema.d.ts.map