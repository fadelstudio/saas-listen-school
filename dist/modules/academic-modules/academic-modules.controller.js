"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.academicModulesController = void 0;
const academic_modules_service_1 = require("./academic-modules.service");
exports.academicModulesController = {
    async getAll(req, res, next) {
        try {
            const result = await academic_modules_service_1.academicModulesService.getAll(req.query);
            res.sendSuccess('Academic Modules fetched', result.items, 200, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const mod = await academic_modules_service_1.academicModulesService.getById(req.params.id);
            res.sendSuccess('Academic Module fetched', mod);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const mod = await academic_modules_service_1.academicModulesService.create(req.body);
            res.sendSuccess('Academic Module created', mod, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const mod = await academic_modules_service_1.academicModulesService.update(req.params.id, req.body);
            res.sendSuccess('Academic Module updated', mod);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await academic_modules_service_1.academicModulesService.delete(req.params.id);
            res.sendSuccess('Academic Module deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=academic-modules.controller.js.map