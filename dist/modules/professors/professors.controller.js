"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorsController = void 0;
const professors_service_1 = require("./professors.service");
exports.professorsController = {
    async getAll(req, res, next) {
        try {
            const result = await professors_service_1.professorsService.getAll(req.query);
            res.sendSuccess('Professors fetched', result.items, 200, {
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
            const professor = await professors_service_1.professorsService.getById(req.params.id);
            res.sendSuccess('Professor fetched', professor);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const professor = await professors_service_1.professorsService.create(req.body);
            res.sendSuccess('Professor created', professor, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const professor = await professors_service_1.professorsService.update(req.params.id, req.body);
            res.sendSuccess('Professor updated', professor);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await professors_service_1.professorsService.delete(req.params.id);
            res.sendSuccess('Professor deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=professors.controller.js.map