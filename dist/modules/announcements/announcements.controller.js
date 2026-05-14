"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementsController = void 0;
const announcements_service_1 = require("./announcements.service");
const AppError_1 = require("../../core/errors/AppError");
exports.announcementsController = {
    async create(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const announcement = await announcements_service_1.announcementsService.create(req.schoolId, req.body, req.user.role);
            res.sendSuccess('Announcement created successfully', announcement, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const announcements = await announcements_service_1.announcementsService.getAll(req.schoolId);
            res.sendSuccess('Announcements fetched', announcements);
        }
        catch (error) {
            next(error);
        }
    },
    async getActive(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const announcement = await announcements_service_1.announcementsService.getActive(req.schoolId);
            res.sendSuccess('Active announcement fetched', announcement);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const announcement = await announcements_service_1.announcementsService.update(req.params.id, req.schoolId, req.body, req.user.role);
            res.sendSuccess('Announcement updated', announcement);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            await announcements_service_1.announcementsService.delete(req.params.id, req.schoolId, req.user.role);
            res.sendSuccess('Announcement deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=announcements.controller.js.map