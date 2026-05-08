"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOtpSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.verifyLoginOtpSchema = exports.updateProfileSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const idSchema_1 = require("../../utils/idSchema");
// ─── Register ─────────────────────────────────────────────────────────────────
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: zod_1.z.string().min(1, 'First name is required').max(50),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(50),
    sex: zod_1.z.enum(['UNDEFINED', 'MALE', 'FEMALE']).default('UNDEFINED'),
    matricule: zod_1.z.union([zod_1.z.string().max(50), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    campusId: idSchema_1.idStringSchema.nullish(),
    classId: idSchema_1.idStringSchema,
});
// ─── Login ────────────────────────────────────────────────────────────────────
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').optional(),
    matricule: zod_1.z.string().min(1, 'Matricule must not be empty').optional(),
    password: zod_1.z.string().min(1, 'Password is required'),
    uti: zod_1.z.string().optional(), // UTI pour la fusion invité → compte
}).refine(data => data.email || data.matricule, {
    message: "Either email or matricule must be provided",
    path: ["email", "matricule"]
});
// ─── Change Password ──────────────────────────────────────────────────────────
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: zod_1.z.string().min(1, 'Confirm password is required'),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(50).optional(),
    lastName: zod_1.z.string().min(1).max(50).optional(),
    matricule: zod_1.z.union([zod_1.z.string().max(50), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    numero: zod_1.z.union([zod_1.z.string().max(120), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    phone: zod_1.z.union([zod_1.z.string().max(40), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    bio: zod_1.z.union([zod_1.z.string().max(1000), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    address: zod_1.z.union([zod_1.z.string().max(255), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    sex: zod_1.z.enum(['UNDEFINED', 'MALE', 'FEMALE']).optional(),
});
exports.verifyLoginOtpSchema = zod_1.z.object({
    challengeId: idSchema_1.idStringSchema,
    otp: zod_1.z
        .string()
        .min(4, 'OTP is required')
        .max(12)
        .regex(/^\d+$/, 'OTP must be numeric'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
exports.resetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(16, 'Invalid token'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: zod_1.z.string().min(1),
})
    .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.resendOtpSchema = zod_1.z.object({
    challengeId: idSchema_1.idStringSchema,
});
//# sourceMappingURL=auth.schema.js.map