"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorsController = void 0;
const professors_service_1 = require("./professors.service");
const AppError_1 = require("../../core/errors/AppError");
exports.professorsController = {
    async getAll(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await professors_service_1.professorsService.getAll(req.schoolId, req.query, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Professors fetched', result.items, 200, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const professor = await professors_service_1.professorsService.getById(req.params.id, req.schoolId, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Professor fetched', professor);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const professor = await professors_service_1.professorsService.create(req.schoolId, req.body);
            res.sendSuccess('Professor created', professor, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const professor = await professors_service_1.professorsService.update(req.params.id, req.schoolId, req.body);
            res.sendSuccess('Professor updated', professor);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            await professors_service_1.professorsService.delete(req.params.id, req.schoolId);
            res.sendSuccess('Professor deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
    async uploadAvatar(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            if (!req.file) {
                throw new AppError_1.BadRequestError('file is required (multipart field: file)');
            }
            const professor = await professors_service_1.professorsService.uploadAvatar(req.schoolId, req.params.id, req.file, { userId: req.user.userId, role: req.user.role });
            res.sendSuccess('Professor photo updated', professor);
        }
        catch (error) {
            next(error);
        }
    },
    async clearAvatar(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const professor = await professors_service_1.professorsService.clearAvatar(req.schoolId, req.params.id, {
                userId: req.user.userId,
                role: req.user.role,
            });
            res.sendSuccess('Professor photo removed', professor);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=professors.controller.js.map