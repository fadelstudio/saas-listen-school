"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
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
    campusId: zod_1.z.string().uuid('Invalid campus ID').optional(),
    classId: zod_1.z.string().uuid('Invalid class ID').optional(),
});
// ─── Login ────────────────────────────────────────────────────────────────────
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').optional(),
    matricule: zod_1.z.string().min(1, 'Matricule must not be empty').optional(),
    password: zod_1.z.string().min(1, 'Password is required'),
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
});
//# sourceMappingURL=auth.schema.js.map