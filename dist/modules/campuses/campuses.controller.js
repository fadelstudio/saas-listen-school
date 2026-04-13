"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campusesController = void 0;
const campuses_service_1 = require("./campuses.service");
exports.campusesController = {
    async getAll(req, res, next) {
        try {
            const result = await campuses_service_1.campusesService.getAll(req.query);
            res.sendSuccess('Campuses fetched', result.items, 200, {
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
            const campus = await campuses_service_1.campusesService.getById(req.params.id);
            res.sendSuccess('Campus fetched', campus);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const campus = await campuses_service_1.campusesService.create(req.body);
            res.sendSuccess('Campus created', campus, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const campus = await campuses_service_1.campusesService.update(req.params.id, req.body);
            res.sendSuccess('Campus updated', campus);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await campuses_service_1.campusesService.delete(req.params.id);
            res.sendSuccess('Campus deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=campuses.controller.js.map