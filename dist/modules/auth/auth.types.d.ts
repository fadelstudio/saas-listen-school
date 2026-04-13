import { Role } from '@prisma/client';
export interface JwtPayload {
    userId: string;
    role: Role;
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
/** User without passwordHash — safe to send in API responses */
export interface SafeUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    isActive: boolean;
    campusId?: string | null;
    classId?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=auth.types.d.ts.map