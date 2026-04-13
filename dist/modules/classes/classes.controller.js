"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classesController = void 0;
const classes_service_1 = require("./classes.service");
exports.classesController = {
    async getAll(req, res, next) {
        try {
            const result = await classes_service_1.classesService.getAll(req.query);
            res.sendSuccess('Classes fetched', result.items, 200, {
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
            const cl = await classes_service_1.classesService.getById(req.params.id);
            res.sendSuccess('Class fetched', cl);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const cl = await classes_service_1.classesService.create(req.body);
            res.sendSuccess('Class created', cl, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const cl = await classes_service_1.classesService.update(req.params.id, req.body);
            res.sendSuccess('Class updated', cl);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await classes_service_1.classesService.delete(req.params.id);
            res.sendSuccess('Class deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=classes.controller.js.map