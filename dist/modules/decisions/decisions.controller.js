"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionsController = void 0;
const decisions_service_1 = require("./decisions.service");
const response_1 = require("../../utils/response");
exports.decisionsController = {
    async create(req, res, next) {
        try {
            const result = await decisions_service_1.decisionsService.create(req.body, req.user.userId, req.user.role);
            (0, response_1.sendSuccess)(res, 'Decision created', result, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await decisions_service_1.decisionsService.getAll(req.query);
            (0, response_1.sendSuccess)(res, 'Decisions fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const result = await decisions_service_1.decisionsService.getById(req.params.id);
            (0, response_1.sendSuccess)(res, 'Decision fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const result = await decisions_service_1.decisionsService.update(req.params.id, req.body, req.user.role);
            (0, response_1.sendSuccess)(res, 'Decision updated', result);
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const result = await decisions_service_1.decisionsService.updateStatus(req.params.id, req.body.status, req.user.role);
            (0, response_1.sendSuccess)(res, 'Decision status updated', result);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await decisions_service_1.decisionsService.delete(req.params.id, req.user.role);
            (0, response_1.sendSuccess)(res, 'Decision deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=decisions.controller.js.map