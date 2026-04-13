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
            campusId: string | null;
            email: string;
            passwordHash: string;
            firstName: string;
            lastName: string;
            matricule: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
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
};
//# sourceMappingURL=auth.repository.d.ts.map