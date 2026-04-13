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
    }
};
//# sourceMappingURL=saas.controller.js.map