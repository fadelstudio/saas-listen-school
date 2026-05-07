"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campusesService = void 0;
const campuses_repository_1 = require("./campuses.repository");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
exports.campusesService = {
    async getAll(schoolId, query, userRole, userCampusIds) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            search: query.search,
            campusIds: ['ADMIN', 'MANAGER', 'VIEWER'].includes(userRole || '') && userCampusIds && userCampusIds.length > 0
                ? userCampusIds
                : undefined,
        };
        const { items, total } = await campuses_repository_1.campusesRepository.findAll(schoolId, filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id, schoolId, userRole, userCampusIds) {
        if (['ADMIN', 'MANAGER', 'VIEWER'].includes(userRole || '') &&
            userCampusIds &&
            userCampusIds.length > 0 &&
            !userCampusIds.includes(id)) {
            throw new AppError_1.NotFoundError('Campus');
        }
        const campus = await campuses_repository_1.campusesRepository.findById(id, schoolId);
        if (!campus)
            throw new AppError_1.NotFoundError('Campus');
        return campus;
    },
    async create(data) {
        return campuses_repository_1.campusesRepository.create(data);
    },
    async update(id, data, schoolId) {
        await this.getById(id, schoolId);
        return campuses_repository_1.campusesRepository.update(id, data, schoolId);
    },
    async delete(id, schoolId) {
        await this.getById(id, schoolId);
        return campuses_repository_1.campusesRepository.delete(id, schoolId);
    },
    async getClasses(id, schoolId, userRole, userCampusIds) {
        await this.getById(id, schoolId, userRole, userCampusIds);
        // Directly using prisma for the linking query to avoid circular dependencies if any
        return campuses_repository_1.campusesRepository.findClasses(id, schoolId);
    },
    async getStudents(id, schoolId, userRole, userCampusIds) {
        await this.getById(id, schoolId, userRole, userCampusIds);
        return campuses_repository_1.campusesRepository.findStudents(id, schoolId);
    },
    async getStats(id, schoolId) {
        return campuses_repository_1.campusesRepository.getStats(id, schoolId);
    },
    async getProfessors(id, schoolId, userRole, userCampusIds) {
        await this.getById(id, schoolId, userRole, userCampusIds);
        return campuses_repository_1.campusesRepository.findProfessors(id, schoolId);
    },
};
//# sourceMappingURL=campuses.service.js.map