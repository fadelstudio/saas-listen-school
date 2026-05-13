import { RegisterInput, LoginInput, ChangePasswordInput, UpdateProfileInput, AuthResponse, SafeUser, LoginResult, RegisterResult, ForgotPasswordInput, ResetPasswordInput, VerifyRegisterOtpInput, GoogleCompleteInput, GoogleAuthResult } from './auth.types';
export declare const authService: {
    register(input: RegisterInput, schoolId: string): Promise<RegisterResult>;
    login(input: LoginInput, schoolId: string): Promise<LoginResult>;
    sendNewRegisterOtp(user: {
        id: string;
        email: string;
    }): Promise<{
        step: "REGISTER_OTP_REQUIRED";
        challengeId: string;
        expiresInSeconds: number;
    }>;
    verifyRegisterOtp(input: VerifyRegisterOtpInput, schoolId: string): Promise<AuthResponse>;
    verifyRegisterLink(challengeId: string): Promise<string>;
    forgotPassword(input: ForgotPasswordInput, schoolId: string): Promise<void>;
    resetPassword(input: ResetPasswordInput): Promise<void>;
    refresh(token: string): Promise<Pick<AuthResponse, "token" | "refreshToken">>;
    logout(token: string): Promise<void>;
    getMe(userId: string): Promise<SafeUser>;
    changePassword(userId: string, input: ChangePasswordInput): Promise<void>;
    updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<SafeUser>;
    clearAvatar(userId: string): Promise<SafeUser>;
    googleStart(idToken: string, schoolId: string): Promise<GoogleAuthResult>;
    googleComplete(input: GoogleCompleteInput, schoolId: string): Promise<GoogleAuthResult>;
    resendOtp(challengeId: string, schoolId: string): Promise<{
        step: "REGISTER_OTP_REQUIRED";
        challengeId: string;
        expiresInSeconds: number;
    }>;
    resendVerification(userId: string): Promise<{
        step: "REGISTER_OTP_REQUIRED";
        challengeId: string;
        expiresInSeconds: number;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map