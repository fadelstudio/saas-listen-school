"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classesService = void 0;
const client_1 = require("@prisma/client");
const classes_repository_1 = require("./classes.repository");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
const prisma_1 = require("../../core/database/prisma");
const audit_service_1 = require("../audit/audit.service");
exports.classesService = {
    async getAll(schoolId, query, userRole, userCampusIds, userClassId) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            campusId: query.campusId,
            levelId: query.levelId,
            search: query.search,
        };
        if (['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'].includes(userRole || '') && userCampusIds && userCampusIds.length > 0) {
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
        if (['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'].includes(userRole || '') &&
            userCampusIds &&
            userCampusIds.length > 0 &&
            !userCampusIds.includes(cl.campusId)) {
            throw new AppError_1.NotFoundError('Class');
        }
        return cl;
    },
    async create(schoolId, data, userRole, userCampusIds, userId) {
        if (userRole === 'VIEWER')
            throw new AppError_1.ForbiddenError('VIEWER role is read-only');
        // Scoping check
        if (userCampusIds && userCampusIds.length > 0 && !userCampusIds.includes(data.campusId)) {
            throw new AppError_1.ForbiddenError('Requested campus is outside your scope');
        }
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
        const result = await classes_repository_1.classesRepository.create(data);
        await audit_service_1.auditService.log({
            schoolId,
            userId,
            action: 'CREATE_CLASS',
            entity: 'Class',
            entityId: result.id,
            details: { name: result.name, campusId: result.campusId }
        });
        return result;
    },
    async update(id, schoolId, data, userRole, userCampusIds, userId) {
        if (userRole === 'VIEWER')
            throw new AppError_1.ForbiddenError('VIEWER role is read-only');
        await this.getById(id, schoolId, userRole, userCampusIds);
        if (data.campusId) {
            if (userCampusIds && userCampusIds.length > 0 && !userCampusIds.includes(data.campusId)) {
                throw new AppError_1.ForbiddenError('Target campus is outside your scope');
            }
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
        await audit_service_1.auditService.log({
            schoolId,
            userId,
            action: 'UPDATE_CLASS',
            entity: 'Class',
            entityId: id,
            details: { updatedFields: Object.keys(data) }
        });
        return updated;
    },
    async delete(id, schoolId, userRole, userCampusIds, userId) {
        if (userRole === 'VIEWER')
            throw new AppError_1.ForbiddenError('VIEWER role is read-only');
        await this.getById(id, schoolId, userRole, userCampusIds);
        const ok = await classes_repository_1.classesRepository.delete(id, schoolId);
        if (!ok)
            throw new AppError_1.NotFoundError('Class');
        await audit_service_1.auditService.log({
            schoolId,
            userId,
            action: 'DELETE_CLASS',
            entity: 'Class',
            entityId: id,
        });
    },
    async getStudents(id, schoolId, userRole, userCampusIds) {
        await this.getById(id, schoolId, userRole, userCampusIds);
        return classes_repository_1.classesRepository.findStudents(id, schoolId);
    },
};
//# sourceMappingURL=classes.service.js.map