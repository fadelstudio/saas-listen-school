"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
exports.authController = {
    async register(req, res, next) {
        try {
            const result = await auth_service_1.authService.register(req.body);
            res.sendSuccess('Account created successfully', result, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body);
            if ('step' in result && result.step === 'EMAIL_OTP_REQUIRED') {
                res.sendSuccess('OTP sent to your email', result);
            }
            else {
                res.sendSuccess('Login successful', result);
            }
        }
        catch (error) {
            next(error);
        }
    },
    async verifyLoginOtp(req, res, next) {
        try {
            const result = await auth_service_1.authService.verifyLoginOtp(req.body);
            res.sendSuccess('Login successful', result);
        }
        catch (error) {
            next(error);
        }
    },
    async forgotPassword(req, res, next) {
        try {
            await auth_service_1.authService.forgotPassword(req.body);
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
};
//# sourceMappingURL=auth.controller.js.map