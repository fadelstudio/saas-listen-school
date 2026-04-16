"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campusesService = void 0;
const campuses_repository_1 = require("./campuses.repository");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
exports.campusesService = {
    async getAll(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            search: query.search,
        };
        const { items, total } = await campuses_repository_1.campusesRepository.findAll(filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id) {
        const campus = await campuses_repository_1.campusesRepository.findById(id);
        if (!campus)
            throw new AppError_1.NotFoundError('Campus');
        return campus;
    },
    async create(data) {
        return campuses_repository_1.campusesRepository.create(data);
    },
    async update(id, data) {
        await this.getById(id);
        return campuses_repository_1.campusesRepository.update(id, data);
    },
    async delete(id) {
        await this.getById(id);
        return campuses_repository_1.campusesRepository.delete(id);
    },
    async getClasses(id) {
        await this.getById(id);
        // Directly using prisma for the linking query to avoid circular dependencies if any
        return campuses_repository_1.campusesRepository.findClasses(id);
    },
    async getStudents(id) {
        await this.getById(id);
        return campuses_repository_1.campusesRepository.findStudents(id);
    },
    async getStats(id) {
        return campuses_repository_1.campusesRepository.getStats(id);
    },
    async getProfessors(id) {
        await this.getById(id);
        return campuses_repository_1.campusesRepository.findProfessors(id);
    },
};
//# sourceMappingURL=campuses.service.js.map