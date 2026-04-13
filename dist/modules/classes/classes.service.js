"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classesService = void 0;
const classes_repository_1 = require("./classes.repository");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
exports.classesService = {
    async getAll(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            campusId: query.campusId,
            levelId: query.levelId,
            search: query.search,
        };
        const { items, total } = await classes_repository_1.classesRepository.findAll(filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id) {
        const cl = await classes_repository_1.classesRepository.findById(id);
        if (!cl)
            throw new AppError_1.NotFoundError('Class');
        return cl;
    },
    async create(data) {
        return classes_repository_1.classesRepository.create(data);
    },
    async update(id, data) {
        await this.getById(id);
        return classes_repository_1.classesRepository.update(id, data);
    },
    async delete(id) {
        await this.getById(id);
        return classes_repository_1.classesRepository.delete(id);
    },
};
//# sourceMappingURL=classes.service.js.map