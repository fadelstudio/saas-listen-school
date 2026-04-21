"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelsController = void 0;
const levels_service_1 = require("./levels.service");
const AppError_1 = require("../../core/errors/AppError");
exports.levelsController = {
    async getAll(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await levels_service_1.levelsService.getAll(req.schoolId, req.query);
            res.sendSuccess('Liste des niveaux récupérée', result.items, 200, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            });
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const level = await levels_service_1.levelsService.getById(req.params.id, req.schoolId);
            res.sendSuccess('Niveau récupéré', level);
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const level = await levels_service_1.levelsService.create(req.schoolId, req.body);
            res.sendSuccess('Niveau créé', level, 201);
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const level = await levels_service_1.levelsService.update(req.params.id, req.schoolId, req.body);
            res.sendSuccess('Niveau mis à jour', level);
        }
        catch (err) {
            next(err);
        }
    },
    async remove(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            await levels_service_1.levelsService.delete(req.params.id, req.schoolId);
            res.sendSuccess('Niveau supprimé', null);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=levels.controller.js.map