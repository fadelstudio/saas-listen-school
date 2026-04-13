"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelsService = void 0;
const levels_repository_1 = require("./levels.repository");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
exports.levelsService = {
    async getAll(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const { items, total } = await levels_repository_1.levelsRepository.findAll(pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id) {
        const level = await levels_repository_1.levelsRepository.findById(id);
        if (!level)
            throw new AppError_1.NotFoundError('Academic Level');
        return level;
    },
    async create(data) {
        return levels_repository_1.levelsRepository.create(data);
    },
    async update(id, data) {
        await this.getById(id);
        return levels_repository_1.levelsRepository.update(id, data);
    },
    async delete(id) {
        await this.getById(id);
        return levels_repository_1.levelsRepository.delete(id);
    },
};
//# sourceMappingURL=levels.service.js.map