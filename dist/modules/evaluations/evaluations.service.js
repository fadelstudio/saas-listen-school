"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationsService = void 0;
const evaluations_repository_1 = require("./evaluations.repository");
const class_modules_repository_1 = require("../class-modules/class-modules.repository");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
const queue_1 = require("../../core/config/queue");
exports.evaluationsService = {
    async create(input, userId) {
        let finalInput = { ...input };
        // 1. Cross-validation: Triple-Link consistency
        const assignment = await class_modules_repository_1.classModulesRepository.findByClassAndModule(finalInput.classId, finalInput.moduleId);
        if (!assignment) {
            throw new AppError_1.BadRequestError('This module is not assigned to the selected class');
        }
        const isAssigned = assignment.professors.some((p) => p.id === finalInput.professorId);
        if (!isAssigned) {
            throw new AppError_1.BadRequestError('This professor is not assigned to this module for this class');
        }
        // 2. User context auto-fill
        if (userId && !finalInput.classId) {
            const user = await evaluations_repository_1.evaluationsRepository.getUserContext(userId);
            if (user) {
                finalInput.classId = user.classId || '';
            }
        }
        const evaluation = await evaluations_repository_1.evaluationsRepository.create(finalInput, userId);
        // 3. Automatic AI Trigger
        try {
            await queue_1.jobQueue.add('ai-analysis', {
                type: 'evaluation-scoring',
                evaluationId: evaluation.id,
            });
        }
        catch (error) {
            console.warn('⚠️ Could not auto-enqueue AI scoring (Redis down?):', error);
        }
        return evaluation;
    },
    async getById(id, userRole) {
        const evaluation = await evaluations_repository_1.evaluationsRepository.findById(id);
        if (!evaluation)
            throw new AppError_1.NotFoundError('Evaluation');
        // Scrub evaluator if anonymous and requester is not admin
        if (evaluation.isAnonymous && !['ADMIN', 'SUPERADMIN'].includes(userRole || '')) {
            evaluation.evaluator = null;
            evaluation.evaluatorId = null;
        }
        return evaluation;
    },
    async getAll(query, userRole) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            status: query.status,
            evaluatorId: query.evaluatorId,
            reportId: query.reportId,
            startDate: query.startDate,
            endDate: query.endDate,
        };
        const { items, total } = await evaluations_repository_1.evaluationsRepository.findAll(filters, pagination);
        // Filter anonymous evaluators for non-admins
        if (!['ADMIN', 'SUPERADMIN'].includes(userRole || '')) {
            items.forEach((item) => {
                if (item.isAnonymous) {
                    item.evaluator = null;
                    item.evaluatorId = null;
                }
            });
        }
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
        try {
            await queue_1.jobQueue.add('ai-analysis', {
                type: 'evaluation-scoring',
                evaluationId: id,
            });
        }
        catch (error) {
            console.warn('⚠️ Could not enqueue AI scoring (Redis down?):', error);
        }
        return { queued: true, evaluationId: id };
    },
};
//# sourceMappingURL=evaluations.service.js.map