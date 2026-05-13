import { z } from 'zod';
import { idStringSchema } from '../../utils/idSchema';

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  sex: z.enum(['UNDEFINED', 'MALE', 'FEMALE']).default('UNDEFINED'),
  matricule: z.union([z.string().max(50), z.literal(''), z.null()]).optional(),
  campusId: idStringSchema.nullish(),
  classId: idStringSchema,
});

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  matricule: z.string().min(1, 'Matricule must not be empty').optional(),
  password: z.string().min(1, 'Password is required'),
  uti: z.string().optional(), // UTI pour la fusion invité → compte
}).refine(data => data.email || data.matricule, {
  message: "Either email or matricule must be provided",
  path: ["email", "matricule"]
});


// ─── Change Password ──────────────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    /** Obligatoire si le compte a déjà un mot de passe local ; omissible pour compte Google-only. */
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Update Profile ───────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  matricule: z.union([z.string().max(50), z.literal(''), z.null()]).optional(),
  numero: z.union([z.string().max(120), z.literal(''), z.null()]).optional(),
  phone: z.union([z.string().max(40), z.literal(''), z.null()]).optional(),
  bio: z.union([z.string().max(1000), z.literal(''), z.null()]).optional(),
  address: z.union([z.string().max(255), z.literal(''), z.null()]).optional(),
  sex: z.enum(['UNDEFINED', 'MALE', 'FEMALE']).optional(),
});

export const verifyLoginOtpSchema = z.object({
  challengeId: idStringSchema,
  otp: z
    .string()
    .min(4, 'OTP is required')
    .max(12)
    .regex(/^\d+$/, 'OTP must be numeric'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(16, 'Invalid token'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resendOtpSchema = z.object({
  challengeId: idStringSchema,
});

export const googleAuthStartSchema = z.object({
  idToken: z.string().min(20, 'Google id_token is required'),
});

export const googleAuthCompleteSchema = z.object({
  pendingToken: z.string().min(20, 'pendingToken is required'),
  classId: idStringSchema,
  campusId: idStringSchema.nullish(),
});


// ─── Exported Types ───────────────────────────────────────────────────────────

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type VerifyLoginOtpSchema = z.infer<typeof verifyLoginOtpSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
