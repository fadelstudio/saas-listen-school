"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.academicModulesService = void 0;
const academic_modules_repository_1 = require("./academic-modules.repository");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
const audit_service_1 = require("../audit/audit.service");
exports.academicModulesService = {
    async getAll(schoolId, query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            search: query.search,
        };
        const { items, total } = await academic_modules_repository_1.academicModulesRepository.findAll(schoolId, filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id, schoolId) {
        const module = await academic_modules_repository_1.academicModulesRepository.findById(id, schoolId);
        if (!module)
            throw new AppError_1.NotFoundError('Academic Module');
        return module;
    },
    async create(schoolId, data, userRole, userId) {
        if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole || '')) {
            throw new AppError_1.ForbiddenError('Insufficient permissions to create modules');
        }
        const mod = await academic_modules_repository_1.academicModulesRepository.create(schoolId, data);
        await audit_service_1.auditService.log({
            schoolId,
            userId,
            action: 'CREATE_MODULE',
            entity: 'AcademicModule',
            entityId: mod.id,
            details: { name: mod.name, code: mod.code }
        });
        return mod;
    },
    async update(id, schoolId, data, userRole, userId) {
        if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole || '')) {
            throw new AppError_1.ForbiddenError('Insufficient permissions to update modules');
        }
        const updated = await academic_modules_repository_1.academicModulesRepository.update(id, schoolId, data);
        if (!updated)
            throw new AppError_1.NotFoundError('Academic Module');
        await audit_service_1.auditService.log({
            schoolId,
            userId,
            action: 'UPDATE_MODULE',
            entity: 'AcademicModule',
            entityId: id,
            details: { updatedFields: Object.keys(data) }
        });
        return updated;
    },
    async delete(id, schoolId, userRole, userId) {
        if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole || '')) {
            throw new AppError_1.ForbiddenError('Insufficient permissions to delete modules');
        }
        const ok = await academic_modules_repository_1.academicModulesRepository.delete(id, schoolId);
        if (!ok)
            throw new AppError_1.NotFoundError('Academic Module');
        await audit_service_1.auditService.log({
            schoolId,
            userId,
            action: 'DELETE_MODULE',
            entity: 'AcademicModule',
            entityId: id,
        });
    },
};
//# sourceMappingURL=academic-modules.service.js.map