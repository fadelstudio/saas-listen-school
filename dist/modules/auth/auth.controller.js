"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
const AppError_1 = require("../../core/errors/AppError");
exports.authController = {
    async register(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await auth_service_1.authService.register(req.body, req.schoolId);
            if ('step' in result && result.step === 'REGISTER_OTP_REQUIRED') {
                res.sendSuccess('Account created. OTP sent to your email for verification.', result, 201);
            }
            else {
                res.sendSuccess('Account created successfully', result, 201);
            }
        }
        catch (error) {
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await auth_service_1.authService.login(req.body, req.schoolId);
            res.sendSuccess('Login successful', result);
        }
        catch (error) {
            next(error);
        }
    },
    async verifyRegisterOtp(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await auth_service_1.authService.verifyRegisterOtp(req.body, req.schoolId);
            res.sendSuccess('Registration verified. Login successful.', result);
        }
        catch (error) {
            next(error);
        }
    },
    async forgotPassword(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            await auth_service_1.authService.forgotPassword(req.body, req.schoolId);
            res.sendSuccess('If an account exists for this email, a reset link has been sent.', null);
        }
        catch (error) {
            next(error);
        }
    },
    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            await auth_service_1.authService.resetPassword({ token, newPassword });
            res.sendSuccess('Password has been reset. Please log in again.', null);
        }
        catch (error) {
            next(error);
        }
    },
    async me(req, res, next) {
        try {
            const user = await auth_service_1.authService.getMe(req.user.userId);
            res.sendSuccess('Profile retrieved', user);
        }
        catch (error) {
            next(error);
        }
    },
    async changePassword(req, res, next) {
        try {
            await auth_service_1.authService.changePassword(req.user.userId, req.body);
            res.sendSuccess('Password changed successfully', null);
        }
        catch (error) {
            next(error);
        }
    },
    async updateProfile(req, res, next) {
        try {
            const user = await auth_service_1.authService.updateProfile(req.user.userId, req.body);
            res.sendSuccess('Profile updated', user);
        }
        catch (error) {
            next(error);
        }
    },
    async uploadAvatar(req, res, next) {
        try {
            const file = req.file;
            if (!file) {
                throw new AppError_1.BadRequestError('file is required (multipart field: file)');
            }
            const user = await auth_service_1.authService.uploadAvatar(req.user.userId, file);
            res.sendSuccess('Profile photo updated', user);
        }
        catch (error) {
            next(error);
        }
    },
    async clearAvatar(req, res, next) {
        try {
            const user = await auth_service_1.authService.clearAvatar(req.user.userId);
            res.sendSuccess('Profile photo removed', user);
        }
        catch (error) {
            next(error);
        }
    },
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await auth_service_1.authService.refresh(refreshToken);
            res.sendSuccess('Token refreshed', result);
        }
        catch (error) {
            next(error);
        }
    },
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await auth_service_1.authService.logout(refreshToken);
            res.sendSuccess('Logged out successfully', null);
        }
        catch (error) {
            next(error);
        }
    },
    async resendOtp(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const { challengeId } = req.body;
            const result = await auth_service_1.authService.resendOtp(challengeId, req.schoolId);
            res.sendSuccess('New OTP sent successfully', result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map