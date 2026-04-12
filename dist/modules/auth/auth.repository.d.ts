import { User } from '@prisma/client';
import { RegisterInput } from './auth.types';
export declare const authRepository: {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: RegisterInput & {
        passwordHash: string;
    }): Promise<User>;
    updatePassword(userId: string, passwordHash: string): Promise<User>;
    updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
    }): Promise<User>;
    setActive(userId: string, isActive: boolean): Promise<User>;
};
//# sourceMappingURL=auth.repository.d.ts.map