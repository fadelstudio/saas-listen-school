"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditController = void 0;
const audit_service_1 = require("./audit.service");
const AppError_1 = require("../../core/errors/AppError");
exports.auditController = {
    async getLogs(req, res, next) {
        try {
            if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN") {
                throw new AppError_1.ForbiddenError("Accès réservé aux administrateurs");
            }
            const schoolId = req.schoolId;
            const { userId, action, entity, page, limit } = req.query;
            const result = await audit_service_1.auditService.getLogs(schoolId, {
                userId: userId,
                action: action,
                entity: entity,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 50,
            });
            res.sendSuccess("Audit logs fetched successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=audit.controller.js.map