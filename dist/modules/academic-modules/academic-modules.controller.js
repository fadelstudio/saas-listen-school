"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.academicModulesController = void 0;
const academic_modules_service_1 = require("./academic-modules.service");
const AppError_1 = require("../../core/errors/AppError");
exports.academicModulesController = {
    async getAll(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await academic_modules_service_1.academicModulesService.getAll(req.schoolId, req.query);
            res.sendSuccess('Academic Modules fetched', result.items, 200, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const mod = await academic_modules_service_1.academicModulesService.getById(req.params.id, req.schoolId);
            res.sendSuccess('Academic Module fetched', mod);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const mod = await academic_modules_service_1.academicModulesService.create(req.schoolId, req.body);
            res.sendSuccess('Academic Module created', mod, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const mod = await academic_modules_service_1.academicModulesService.update(req.params.id, req.schoolId, req.body);
            res.sendSuccess('Academic Module updated', mod);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            await academic_modules_service_1.academicModulesService.delete(req.params.id, req.schoolId);
            res.sendSuccess('Academic Module deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=academic-modules.controller.js.map