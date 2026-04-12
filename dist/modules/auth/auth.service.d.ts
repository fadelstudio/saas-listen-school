import { RegisterInput, LoginInput, ChangePasswordInput, UpdateProfileInput, AuthResponse, SafeUser } from './auth.types';
export declare const authService: {
    register(input: RegisterInput): Promise<AuthResponse>;
    login(input: LoginInput): Promise<AuthResponse>;
    getMe(userId: string): Promise<SafeUser>;
    changePassword(userId: string, input: ChangePasswordInput): Promise<void>;
    updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser>;
};
//# sourceMappingURL=auth.service.d.ts.map