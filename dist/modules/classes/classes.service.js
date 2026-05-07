"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classesService = void 0;
const client_1 = require("@prisma/client");
const classes_repository_1 = require("./classes.repository");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
const prisma_1 = require("../../core/database/prisma");
exports.classesService = {
    async getAll(schoolId, query, userRole, userCampusIds, userClassId) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            campusId: query.campusId,
            levelId: query.levelId,
            search: query.search,
        };
        if (['ADMIN', 'MANAGER', 'VIEWER'].includes(userRole || '') && userCampusIds && userCampusIds.length > 0) {
            if (filters.campusId && !userCampusIds.includes(filters.campusId)) {
                throw new AppError_1.BadRequestError('Requested campus is outside your scope');
            }
            if (!filters.campusId)
                filters.campusIds = userCampusIds;
        }
        if (userRole === 'STUDENT' && userClassId) {
            filters.classId = userClassId;
        }
        const { items, total } = await classes_repository_1.classesRepository.findAll(schoolId, filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id, schoolId, userRole, userCampusIds) {
        const cl = await classes_repository_1.classesRepository.findById(id, schoolId);
        if (!cl)
            throw new AppError_1.NotFoundError('Class');
        if (['ADMIN', 'MANAGER', 'VIEWER'].includes(userRole || '') &&
            userCampusIds &&
            userCampusIds.length > 0 &&
            !userCampusIds.includes(cl.campusId)) {
            throw new AppError_1.NotFoundError('Class');
        }
        return cl;
    },
    async create(schoolId, data) {
        const campus = await prisma_1.prisma.campus.findFirst({
            where: { id: data.campusId, schoolId },
        });
        if (!campus)
            throw new AppError_1.BadRequestError('Campus does not belong to this school');
        const levelWhere = client_1.Prisma.validator()({
            id: data.levelId,
            schoolId,
        });
        const level = await prisma_1.prisma.academicLevel.findFirst({ where: levelWhere });
        if (!level)
            throw new AppError_1.BadRequestError('Academic level does not belong to this school');
        return classes_repository_1.classesRepository.create(data);
    },
    async update(id, schoolId, data) {
        if (data.campusId) {
            const campus = await prisma_1.prisma.campus.findFirst({
                where: { id: data.campusId, schoolId },
            });
            if (!campus)
                throw new AppError_1.BadRequestError('Campus does not belong to this school');
        }
        if (data.levelId) {
            const levelWhere = client_1.Prisma.validator()({
                id: data.levelId,
                schoolId,
            });
            const level = await prisma_1.prisma.academicLevel.findFirst({ where: levelWhere });
            if (!level)
                throw new AppError_1.BadRequestError('Academic level does not belong to this school');
        }
        const updated = await classes_repository_1.classesRepository.update(id, schoolId, data);
        if (!updated)
            throw new AppError_1.NotFoundError('Class');
        return updated;
    },
    async delete(id, schoolId) {
        const ok = await classes_repository_1.classesRepository.delete(id, schoolId);
        if (!ok)
            throw new AppError_1.NotFoundError('Class');
    },
    async getStudents(id, schoolId, userRole, userCampusIds) {
        await this.getById(id, schoolId, userRole, userCampusIds);
        return classes_repository_1.classesRepository.findStudents(id, schoolId);
    },
};
//# sourceMappingURL=classes.service.js.map