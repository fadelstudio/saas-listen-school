"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.academicModulesService = void 0;
const academic_modules_repository_1 = require("./academic-modules.repository");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
exports.academicModulesService = {
    async getAll(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            search: query.search,
        };
        const { items, total } = await academic_modules_repository_1.academicModulesRepository.findAll(filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id) {
        const module = await academic_modules_repository_1.academicModulesRepository.findById(id);
        if (!module)
            throw new AppError_1.NotFoundError('Academic Module');
        return module;
    },
    async create(data) {
        return academic_modules_repository_1.academicModulesRepository.create(data);
    },
    async update(id, data) {
        await this.getById(id);
        return academic_modules_repository_1.academicModulesRepository.update(id, data);
    },
    async delete(id) {
        await this.getById(id);
        return academic_modules_repository_1.academicModulesRepository.delete(id);
    },
};
//# sourceMappingURL=academic-modules.service.js.map