import { User } from '@prisma/client';
import { RegisterInput } from './auth.types';
export declare const authRepository: {
    findByEmail(email: string): Promise<User | null>;
    findByIdentifier(identifier: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: RegisterInput & {
        passwordHash: string;
    }): Promise<User>;
    updatePassword(userId: string, passwordHash: string): Promise<User>;
    updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
    }): Promise<User>;
    createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        token: string;
        expiresAt: Date;
    }>;
    findRefreshToken(token: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            email: string;
            passwordHash: string;
            firstName: string;
            lastName: string;
            matricule: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            fcmToken: string | null;
            emailVerified: boolean;
            emailVerifiedAt: Date | null;
            campusId: string | null;
            classId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        token: string;
        expiresAt: Date;
    }) | null>;
    deleteRefreshToken(token: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        token: string;
        expiresAt: Date;
    }>;
    deleteAllUserRefreshTokens(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    setActive(userId: string, isActive: boolean): Promise<User>;
    deleteLoginChallengesForUser(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    createLoginOtpChallenge(userId: string, otpHash: string, expiresAt: Date): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        otpHash: string;
        attempts: number;
    }>;
    findLoginOtpChallengeById(id: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            email: string;
            passwordHash: string;
            firstName: string;
            lastName: string;
            matricule: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            fcmToken: string | null;
            emailVerified: boolean;
            emailVerifiedAt: Date | null;
            campusId: string | null;
            classId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        otpHash: string;
        attempts: number;
    }) | null>;
    incrementLoginOtpAttempts(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        otpHash: string;
        attempts: number;
    }>;
    deleteLoginOtpChallenge(id: string): Promise<void | {
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        otpHash: string;
        attempts: number;
    }>;
    deletePasswordResetTokensForUser(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        tokenHash: string;
        usedAt: Date | null;
    }>;
    findPasswordResetByTokenHash(tokenHash: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            email: string;
            passwordHash: string;
            firstName: string;
            lastName: string;
            matricule: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            fcmToken: string | null;
            emailVerified: boolean;
            emailVerifiedAt: Date | null;
            campusId: string | null;
            classId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        tokenHash: string;
        usedAt: Date | null;
    }) | null>;
    markPasswordResetUsed(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        tokenHash: string;
        usedAt: Date | null;
    }>;
};
//# sourceMappingURL=auth.repository.d.ts.map