import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    sex: z.ZodDefault<z.ZodEnum<{
        UNDEFINED: "UNDEFINED";
        MALE: "MALE";
        FEMALE: "FEMALE";
    }>>;
    matricule: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">, z.ZodNull]>>;
    campusId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    classId: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    matricule: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    uti: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    matricule: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">, z.ZodNull]>>;
    numero: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">, z.ZodNull]>>;
    phone: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">, z.ZodNull]>>;
    bio: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">, z.ZodNull]>>;
    address: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">, z.ZodNull]>>;
    sex: z.ZodOptional<z.ZodEnum<{
        UNDEFINED: "UNDEFINED";
        MALE: "MALE";
        FEMALE: "FEMALE";
    }>>;
}, z.core.$strip>;
export declare const verifyLoginOtpSchema: z.ZodObject<{
    challengeId: z.ZodString;
    otp: z.ZodString;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export declare const resendOtpSchema: z.ZodObject<{
    challengeId: z.ZodString;
}, z.core.$strip>;
export declare const googleAuthStartSchema: z.ZodObject<{
    idToken: z.ZodString;
}, z.core.$strip>;
export declare const googleAuthCompleteSchema: z.ZodObject<{
    pendingToken: z.ZodString;
    classId: z.ZodString;
    campusId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type VerifyLoginOtpSchema = z.infer<typeof verifyLoginOtpSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
//# sourceMappingURL=auth.schema.d.ts.map