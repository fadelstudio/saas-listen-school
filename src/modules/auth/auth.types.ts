import { Role } from '@prisma/client';

// ─── JWT ──────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  role: Role;
  schoolId?: string | null;
  campusIds?: string[];
  classId?: string | null;
  iat: number;
  exp: number;
}

// ─── Inputs ───────────────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  campusId?: string;
  classId?: string;
}

export interface LoginInput {
  email?: string;
  matricule?: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  matricule?: string | null;
  numero?: string | null;
  phone?: string | null;
  bio?: string | null;
  address?: string | null;
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: SafeUser;
}

export interface RegisterOtpRequired {
  step: "REGISTER_OTP_REQUIRED";
  challengeId: string;
  expiresInSeconds: number;
}

export type LoginResult = AuthResponse;
export type RegisterResult = AuthResponse | RegisterOtpRequired;

/** User without passwordHash — safe to send in API responses */
export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  matricule?: string | null;
  numero?: string | null;
  phone?: string | null;
  bio?: string | null;
  address?: string | null;
  campusIds?: string[];
  classId?: string | null;
  schoolId?: string | null;
  /** URL signée (bucket Supabase) — rafraîchir après expiration via GET /auth/me */
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface VerifyLoginOtpInput {
  challengeId: string;
  otp: string;
}

export type VerifyRegisterOtpInput = VerifyLoginOtpInput;
