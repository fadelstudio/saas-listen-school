import { User } from '@prisma/client';
import { RegisterInput } from './auth.types';
export declare const authRepository: {
    findByEmail(email: string, schoolId: string): Promise<({
        campuses: {
            id: string;
        }[];
    } & {
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string | null;
        phone: string | null;
        passwordHash: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        bio: string | null;
        address: string | null;
        avatarPath: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        fcmToken: string | null;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        currentSessionId: string | null;
        classId: string | null;
    }) | null>;
    findByIdentifier(identifier: string, schoolId: string): Promise<({
        campuses: {
            id: string;
        }[];
    } & {
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string | null;
        phone: string | null;
        passwordHash: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        bio: string | null;
        address: string | null;
        avatarPath: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        fcmToken: string | null;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        currentSessionId: string | null;
        classId: string | null;
    }) | null>;
    /** Pour message d’erreur login : compte connu mais mauvais tenant (x-school-slug). */
    findByIdentifierGlobal(identifier: string): Promise<({
        school: {
            name: string;
            slug: string;
        } | null;
    } & {
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string | null;
        phone: string | null;
        passwordHash: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        bio: string | null;
        address: string | null;
        avatarPath: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        fcmToken: string | null;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        currentSessionId: string | null;
        classId: string | null;
    }) | null>;
    findById(id: string): Promise<({
        campuses: {
            id: string;
        }[];
    } & {
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string | null;
        phone: string | null;
        passwordHash: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        bio: string | null;
        address: string | null;
        avatarPath: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        fcmToken: string | null;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        currentSessionId: string | null;
        classId: string | null;
    }) | null>;
    create(data: RegisterInput & {
        passwordHash: string;
        schoolId: string;
        /** Si false (OTP requis), compte créé mais login interdit jusqu'à verify-otp. */
        emailVerified?: boolean;
    }): Promise<{
        campuses: {
            id: string;
        }[];
    } & {
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string | null;
        phone: string | null;
        passwordHash: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        bio: string | null;
        address: string | null;
        avatarPath: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        fcmToken: string | null;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        currentSessionId: string | null;
        classId: string | null;
    }>;
    updatePassword(userId: string, passwordHash: string): Promise<User>;
    updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
        matricule?: string | null;
        numero?: string | null;
        phone?: string | null;
    }): Promise<User>;
    updateAvatarPath(userId: string, avatarPath: string | null): Promise<User>;
    createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        token: string;
        expiresAt: Date;
    }>;
    findRefreshToken(token: string): Promise<({
        user: {
            campuses: {
                id: string;
            }[];
        } & {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            phone: string | null;
            passwordHash: string;
            firstName: string;
            lastName: string;
            matricule: string | null;
            numero: string | null;
            bio: string | null;
            address: string | null;
            avatarPath: string | null;
            sex: import("@prisma/client").$Enums.Sex;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            fcmToken: string | null;
            emailVerified: boolean;
            emailVerifiedAt: Date | null;
            currentSessionId: string | null;
            classId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        token: string;
        expiresAt: Date;
    }) | null>;
    deleteRefreshToken(token: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
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
            campuses: {
                id: string;
            }[];
        } & {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            phone: string | null;
            passwordHash: string;
            firstName: string;
            lastName: string;
            matricule: string | null;
            numero: string | null;
            bio: string | null;
            address: string | null;
            avatarPath: string | null;
            sex: import("@prisma/client").$Enums.Sex;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            fcmToken: string | null;
            emailVerified: boolean;
            emailVerifiedAt: Date | null;
            currentSessionId: string | null;
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
            campuses: {
                id: string;
            }[];
        } & {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            phone: string | null;
            passwordHash: string;
            firstName: string;
            lastName: string;
            matricule: string | null;
            numero: string | null;
            bio: string | null;
            address: string | null;
            avatarPath: string | null;
            sex: import("@prisma/client").$Enums.Sex;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            fcmToken: string | null;
            emailVerified: boolean;
            emailVerifiedAt: Date | null;
            currentSessionId: string | null;
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