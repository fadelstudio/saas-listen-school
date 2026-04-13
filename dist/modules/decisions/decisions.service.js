"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionsService = void 0;
const decisions_repository_1 = require("./decisions.repository");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
const queue_1 = require("../../core/config/queue");
exports.decisionsService = {
    async create(input, userId, userRole) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can create decisions');
        }
        const decision = await decisions_repository_1.decisionsRepository.create(input, userId);
        // Automatically enqueue AI suggestion
        try {
            await queue_1.jobQueue.add('ai-analysis', {
                type: 'decision-suggestion',
                decisionId: decision.id,
            });
        }
        catch (error) {
            console.warn('⚠️ Could not enqueue AI suggestion (Redis down?):', error);
        }
        return decision;
    },
    async getById(id) {
        const decision = await decisions_repository_1.decisionsRepository.findById(id);
        if (!decision)
            throw new AppError_1.NotFoundError('Decision');
        return decision;
    },
    async getAll(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            status: query.status,
            deciderId: query.deciderId,
            startDate: query.startDate,
            endDate: query.endDate,
        };
        const { items, total } = await decisions_repository_1.decisionsRepository.findAll(filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async update(id, input, userRole) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can update decisions');
        }
        const exists = await decisions_repository_1.decisionsRepository.existsById(id);
        if (!exists)
            throw new AppError_1.NotFoundError('Decision');
        return decisions_repository_1.decisionsRepository.update(id, input);
    },
    async updateStatus(id, status, userRole) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can change decision status');
        }
        const exists = await decisions_repository_1.decisionsRepository.existsById(id);
        if (!exists)
            throw new AppError_1.NotFoundError('Decision');
        return decisions_repository_1.decisionsRepository.updateStatus(id, status);
    },
    async delete(id, userRole) {
        if (userRole !== 'ADMIN')
            throw new AppError_1.ForbiddenError('Only ADMIN can delete decisions');
        const exists = await decisions_repository_1.decisionsRepository.existsById(id);
        if (!exists)
            throw new AppError_1.NotFoundError('Decision');
        return decisions_repository_1.decisionsRepository.delete(id);
    },
};
//# sourceMappingURL=decisions.service.js.map