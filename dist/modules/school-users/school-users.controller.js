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
    async update(req, res, next) {
        try {
            const result = await school_users_service_1.schoolUsersService.update(req.user.userId, req.params.id, req.body);
            res.sendSuccess('User updated', result);
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=school-users.controller.js.map