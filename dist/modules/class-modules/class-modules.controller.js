"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classModulesController = void 0;
const class_modules_service_1 = require("./class-modules.service");
const AppError_1 = require("../../core/errors/AppError");
exports.classModulesController = {
    async getAll(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const filters = {
                classId: req.query.classId,
                moduleId: req.query.moduleId,
            };
            const assignments = await class_modules_service_1.classModulesService.getAll(req.schoolId, filters, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Affectations récupérées', assignments);
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const { id } = req.params;
            const assignment = await class_modules_service_1.classModulesService.getById(id, req.schoolId, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Affectation récupérée', assignment);
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const assignment = await class_modules_service_1.classModulesService.create(req.schoolId, req.body, req.user?.role, req.user?.campusIds, req.user?.userId);
            res.sendSuccess('Affectation créée', assignment, 201);
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const { id } = req.params;
            const assignment = await class_modules_service_1.classModulesService.update(id, req.schoolId, req.body, req.user?.role, req.user?.campusIds, req.user?.userId);
            res.sendSuccess('Affectation mise à jour', assignment);
        }
        catch (err) {
            next(err);
        }
    },
    async remove(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const { id } = req.params;
            await class_modules_service_1.classModulesService.delete(id, req.schoolId, req.user?.role, req.user?.campusIds, req.user?.userId);
            res.sendSuccess('Affectation supprimée', null);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=class-modules.controller.js.map