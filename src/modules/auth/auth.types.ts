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
  sex?: 'UNDEFINED' | 'MALE' | 'FEMALE';
  matricule?: string | null;
  campusId?: string;
  classId?: string;
}

export interface LoginInput {
  email?: string;
  matricule?: string;
  password: string;
}

export interface ChangePasswordInput {
  /** Requis seulement si le compte a un mot de passe local. */
  currentPassword?: string;
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
  sex?: 'UNDEFINED' | 'MALE' | 'FEMALE';
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

export interface GoogleSelectClassStep {
  step: 'GOOGLE_SELECT_CLASS';
  pendingToken: string;
  expiresInSeconds: number;
}

export type GoogleAuthResult = AuthResponse | RegisterOtpRequired | GoogleSelectClassStep;

export interface GoogleCompleteInput {
  pendingToken: string;
  classId: string;
  campusId?: string | null;
}

/** User without passwordHash — safe to send in API responses */
export interface SafeUser {
  id: string;
  email: string;
  /** Indique si un mot de passe local est défini (false = compte Google-only ou mot de passe non défini). */
  hasPassword?: boolean;
  firstName: string;
  lastName: string;
  sex?: 'UNDEFINED' | 'MALE' | 'FEMALE';
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
  class?: { id: string, name: string } | null;
  campuses?: { id: string, name: string }[];
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
