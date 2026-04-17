import { Role } from '@prisma/client';
export interface JwtPayload {
    userId: string;
    role: Role;
    schoolId?: string | null;
    campusId?: string | null;
    classId?: string | null;
    iat: number;
    exp: number;
}
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
}
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
    campusId?: string | null;
    classId?: string | null;
    schoolId?: string | null;
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
//# sourceMappingURL=auth.types.d.ts.map