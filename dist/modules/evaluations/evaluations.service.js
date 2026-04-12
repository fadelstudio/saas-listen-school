"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationsService = void 0;
const evaluations_repository_1 = require("./evaluations.repository");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
const queue_1 = require("../../core/config/queue");
exports.evaluationsService = {
    async create(input, userId) {
        return evaluations_repository_1.evaluationsRepository.create(input, userId);
    },
    async getById(id) {
        const evaluation = await evaluations_repository_1.evaluationsRepository.findById(id);
        if (!evaluation)
            throw new AppError_1.NotFoundError('Evaluation');
        return evaluation;
    },
    async getAll(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            status: query.status,
            evaluatorId: query.evaluatorId,
            reportId: query.reportId,
            startDate: query.startDate,
            endDate: query.endDate,
        };
        const { items, total } = await evaluations_repository_1.evaluationsRepository.findAll(filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async update(id, input, userId, userRole) {
        const evaluation = await evaluations_repository_1.evaluationsRepository.findById(id);
        if (!evaluation)
            throw new AppError_1.NotFoundError('Evaluation');
        if (evaluation.evaluatorId !== userId && !['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('You do not have permission to update this evaluation');
        }
        return evaluations_repository_1.evaluationsRepository.update(id, input);
    },
    async delete(id, userRole) {
        if (userRole !== 'ADMIN')
            throw new AppError_1.ForbiddenError('Only ADMIN can delete evaluations');
        const exists = await evaluations_repository_1.evaluationsRepository.existsById(id);
        if (!exists)
            throw new AppError_1.NotFoundError('Evaluation');
        return evaluations_repository_1.evaluationsRepository.delete(id);
    },
    async getStats(query) {
        const filters = {
            reportId: query.reportId,
            startDate: query.startDate,
            endDate: query.endDate,
        };
        return evaluations_repository_1.evaluationsRepository.getAggregatedStats(filters);
    },
    async triggerAiScoring(id, userRole) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can trigger AI scoring');
        }
        const exists = await evaluations_repository_1.evaluationsRepository.existsById(id);
        if (!exists)
            throw new AppError_1.NotFoundError('Evaluation');
        await queue_1.jobQueue.add('ai-analysis', {
            type: 'evaluation-scoring',
            evaluationId: id,
        });
        return { queued: true, evaluationId: id };
    },
};
//# sourceMappingURL=evaluations.service.js.map