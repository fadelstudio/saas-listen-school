"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saasController = void 0;
const saas_service_1 = require("./saas.service");
exports.saasController = {
    async createSchool(req, res, next) {
        try {
            const result = await saas_service_1.saasService.createSchool(req.body);
            res.sendSuccess('School created and Admin assigned successfully', result, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async listSchools(_req, res, next) {
        try {
            const schools = await saas_service_1.saasService.listSchools();
            res.sendSuccess('Schools retrieved successfully', schools);
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const school = await saas_service_1.saasService.getSchoolById(req.params.id);
            res.sendSuccess('School retrieved successfully', school);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const school = await saas_service_1.saasService.updateSchool(req.params.id, req.body);
            res.sendSuccess('School updated successfully', school);
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=saas.controller.js.map