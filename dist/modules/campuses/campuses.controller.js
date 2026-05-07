"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campusesController = void 0;
const campuses_service_1 = require("./campuses.service");
const AppError_1 = require("../../core/errors/AppError");
exports.campusesController = {
    async getAll(req, res, next) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId context missing');
            const result = await campuses_service_1.campusesService.getAll(schoolId, req.query, req.user?.role, req.user?.campusIds);
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
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId context missing');
            const campus = await campuses_service_1.campusesService.getById(req.params.id, schoolId, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Campus fetched', campus);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId) {
                throw new AppError_1.BadRequestError('schoolId is required to create a campus');
            }
            const campus = await campuses_service_1.campusesService.create({
                ...req.body,
                schoolId,
            });
            res.sendSuccess('Campus created', campus, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId context missing');
            const campus = await campuses_service_1.campusesService.update(req.params.id, req.body, schoolId);
            res.sendSuccess('Campus updated', campus);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId context missing');
            await campuses_service_1.campusesService.delete(req.params.id, schoolId);
            res.sendSuccess('Campus deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
    async getClasses(req, res, next) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId context missing');
            const classes = await campuses_service_1.campusesService.getClasses(req.params.id, schoolId, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Classes for campus fetched', classes);
        }
        catch (error) {
            next(error);
        }
    },
    async getStudents(req, res, next) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId context missing');
            const students = await campuses_service_1.campusesService.getStudents(req.params.id, schoolId, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Students for campus fetched', students);
        }
        catch (error) {
            next(error);
        }
    },
    async getStats(req, res, next) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId context missing');
            const stats = await campuses_service_1.campusesService.getStats(req.params.id, schoolId);
            res.sendSuccess('Campus stats fetched', stats);
        }
        catch (error) {
            next(error);
        }
    },
    async getProfessors(req, res, next) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId context missing');
            const professors = await campuses_service_1.campusesService.getProfessors(req.params.id, schoolId, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Professors for campus fetched', professors);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=campuses.controller.js.map