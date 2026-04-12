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
}
export interface LoginInput {
    email: string;
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
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=auth.types.d.ts.map