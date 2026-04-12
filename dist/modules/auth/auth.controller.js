"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
exports.authController = {
    async register(req, res, next) {
        try {
            const result = await auth_service_1.authService.register(req.body);
            (0, response_1.sendSuccess)(res, 'Account created successfully', result, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body);
            (0, response_1.sendSuccess)(res, 'Login successful', result);
        }
        catch (error) {
            next(error);
        }
    },
    async me(req, res, next) {
        try {
            const user = await auth_service_1.authService.getMe(req.user.userId);
            (0, response_1.sendSuccess)(res, 'Profile retrieved', user);
        }
        catch (error) {
            next(error);
        }
    },
    async changePassword(req, res, next) {
        try {
            await auth_service_1.authService.changePassword(req.user.userId, req.body);
            (0, response_1.sendSuccess)(res, 'Password changed successfully', null);
        }
        catch (error) {
            next(error);
        }
    },
    async updateProfile(req, res, next) {
        try {
            const user = await auth_service_1.authService.updateProfile(req.user.userId, req.body);
            (0, response_1.sendSuccess)(res, 'Profile updated', user);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map