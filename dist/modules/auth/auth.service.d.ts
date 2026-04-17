import { RegisterInput, LoginInput, ChangePasswordInput, UpdateProfileInput, AuthResponse, SafeUser, LoginResult, RegisterResult, ForgotPasswordInput, ResetPasswordInput, VerifyRegisterOtpInput } from './auth.types';
export declare const authService: {
    register(input: RegisterInput): Promise<RegisterResult>;
    login(input: LoginInput): Promise<LoginResult>;
    sendNewRegisterOtp(user: {
        id: string;
        email: string;
    }): Promise<{
        step: "REGISTER_OTP_REQUIRED";
        challengeId: string;
        expiresInSeconds: number;
    }>;
    verifyRegisterOtp(input: VerifyRegisterOtpInput): Promise<AuthResponse>;
    forgotPassword(input: ForgotPasswordInput): Promise<void>;
    resetPassword(input: ResetPasswordInput): Promise<void>;
    refresh(token: string): Promise<Pick<AuthResponse, "token" | "refreshToken">>;
    logout(token: string): Promise<void>;
    getMe(userId: string): Promise<SafeUser>;
    changePassword(userId: string, input: ChangePasswordInput): Promise<void>;
    updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser>;
    resendOtp(challengeId: string): Promise<{
        step: "REGISTER_OTP_REQUIRED";
        challengeId: string;
        expiresInSeconds: number;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map