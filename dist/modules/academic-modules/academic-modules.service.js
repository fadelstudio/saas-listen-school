"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.academicModulesService = void 0;
const academic_modules_repository_1 = require("./academic-modules.repository");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
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
    async create(schoolId, data) {
        return academic_modules_repository_1.academicModulesRepository.create(schoolId, data);
    },
    async update(id, schoolId, data) {
        const updated = await academic_modules_repository_1.academicModulesRepository.update(id, schoolId, data);
        if (!updated)
            throw new AppError_1.NotFoundError('Academic Module');
        return updated;
    },
    async delete(id, schoolId) {
        const ok = await academic_modules_repository_1.academicModulesRepository.delete(id, schoolId);
        if (!ok)
            throw new AppError_1.NotFoundError('Academic Module');
    },
};
//# sourceMappingURL=academic-modules.service.js.map