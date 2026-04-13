"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorsService = void 0;
const professors_repository_1 = require("./professors.repository");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
exports.professorsService = {
    async getAll(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            campusId: query.campusId,
            search: query.search,
        };
        const { items, total } = await professors_repository_1.professorsRepository.findAll(filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id) {
        const professor = await professors_repository_1.professorsRepository.findById(id);
        if (!professor)
            throw new AppError_1.NotFoundError('Professor');
        return professor;
    },
    async create(data) {
        return professors_repository_1.professorsRepository.create(data);
    },
    async update(id, data) {
        await this.getById(id);
        return professors_repository_1.professorsRepository.update(id, data);
    },
    async delete(id) {
        await this.getById(id);
        return professors_repository_1.professorsRepository.delete(id);
    },
};
//# sourceMappingURL=professors.service.js.map