"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolUsersController = void 0;
const school_users_service_1 = require("./school-users.service");
exports.schoolUsersController = {
    async create(req, res, next) {
        try {
            const result = await school_users_service_1.schoolUsersService.create(req.user.userId, req.body);
            res.sendSuccess('User created', result, 201);
        }
        catch (e) {
            next(e);
        }
    },
    async list(req, res, next) {
        try {
            const result = await school_users_service_1.schoolUsersService.list(req.user.userId, req.query);
            res.sendSuccess('Users retrieved', result.items, 200, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            });
        }
        catch (e) {
            next(e);
        }
    },
    async listStaff(req, res, next) {
        try {
            const result = await school_users_service_1.schoolUsersService.listStaff(req.user.userId, req.query);
            res.sendSuccess('Staff retrieved', result.items, 200, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            });
        }
        catch (e) {
            next(e);
        }
    },
    async listStudents(req, res, next) {
        try {
            const result = await school_users_service_1.schoolUsersService.listStudents(req.user.userId, req.query);
            res.sendSuccess('Students retrieved', result.items, 200, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            });
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const result = await school_users_service_1.schoolUsersService.getById(req.user.userId, req.params.id);
            res.sendSuccess('User retrieved', result);
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            const result = await school_users_service_1.schoolUsersService.update(req.user.userId, req.params.id, req.body);
            res.sendSuccess('User updated', result);
        }
        catch (e) {
            next(e);
        }
    },
    async delete(req, res, next) {
        try {
            await school_users_service_1.schoolUsersService.delete(req.user.userId, req.params.id);
            res.sendSuccess('User deleted successfully', null);
        }
        catch (e) {
            next(e);
        }
    },
    async resetPasswordToDefault(req, res, next) {
        try {
            const result = await school_users_service_1.schoolUsersService.resetPasswordToDefault(req.user.userId, req.params.id);
            res.sendSuccess('Password reset', result);
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=school-users.controller.js.map