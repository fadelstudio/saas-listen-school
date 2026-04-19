"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelsService = void 0;
const levels_repository_1 = require("./levels.repository");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
exports.levelsService = {
    async getAll(schoolId, query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const { items, total } = await levels_repository_1.levelsRepository.findAll(schoolId, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id, schoolId) {
        const level = await levels_repository_1.levelsRepository.findById(id, schoolId);
        if (!level)
            throw new AppError_1.NotFoundError('Academic Level');
        return level;
    },
    async create(schoolId, data) {
        return levels_repository_1.levelsRepository.create(schoolId, data);
    },
    async update(id, schoolId, data) {
        const updated = await levels_repository_1.levelsRepository.update(id, schoolId, data);
        if (!updated)
            throw new AppError_1.NotFoundError('Academic Level');
        return updated;
    },
    async delete(id, schoolId) {
        const ok = await levels_repository_1.levelsRepository.delete(id, schoolId);
        if (!ok)
            throw new AppError_1.NotFoundError('Academic Level');
    },
};
//# sourceMappingURL=levels.service.js.map