"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationsService = void 0;
const evaluations_repository_1 = require("./evaluations.repository");
const class_modules_repository_1 = require("../class-modules/class-modules.repository");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
const queue_1 = require("../../core/config/queue");
const prisma_1 = require("../../core/database/prisma");
const audit_service_1 = require("../audit/audit.service");
exports.evaluationsService = {
    resolveScopedCampusFilter(userRole, userCampusIds, requestedCampusId) {
        if (!userRole || !['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'].includes(userRole))
            return undefined;
        if (!userCampusIds || userCampusIds.length === 0)
            return undefined;
        if (requestedCampusId) {
            if (!userCampusIds.includes(requestedCampusId)) {
                throw new AppError_1.ForbiddenError('Requested campus is outside your scope');
            }
            return [requestedCampusId];
        }
        return userCampusIds;
    },
    async create(input, userId, schoolId, userRole) {
        if (userRole === 'VIEWER')
            throw new AppError_1.ForbiddenError('VIEWER role is read-only');
        let finalInput = { ...input };
        // 1. User context auto-fill (needed before school / class-module resolution)
        if (userId && !finalInput.classId) {
            const user = await evaluations_repository_1.evaluationsRepository.getUserContext(userId);
            if (user) {
                finalInput.classId = user.classId || '';
            }
        }
        let resolvedSchoolId = schoolId ?? null;
        if (!resolvedSchoolId && finalInput.classId) {
            const cls = await prisma_1.prisma.class.findUnique({
                where: { id: finalInput.classId },
                select: { campus: { select: { schoolId: true } } },
            });
            resolvedSchoolId = cls?.campus?.schoolId ?? null;
        }
        if (!resolvedSchoolId) {
            throw new AppError_1.BadRequestError('School context is required');
        }
        // 2. Cross-validation: Triple-Link consistency (tenant-scoped)
        const assignment = await class_modules_repository_1.classModulesRepository.findByClassAndModule(finalInput.classId, finalInput.moduleId, resolvedSchoolId);
        if (!assignment) {
            throw new AppError_1.BadRequestError('This module is not assigned to the selected class');
        }
        const isAssigned = assignment.professors.some((p) => p.id === finalInput.professorId);
        if (!isAssigned) {
            throw new AppError_1.BadRequestError('This professor is not assigned to this module for this class');
        }
        // 3. Prevent duplicate evaluation for the same campaign
        if (finalInput.campaignId && userId) {
            const existing = await prisma_1.prisma.evaluation.findFirst({
                where: {
                    campaignId: finalInput.campaignId,
                    evaluatorId: userId,
                },
            });
            if (existing) {
                throw new AppError_1.BadRequestError('Vous avez déjà participé à cette évaluation.');
            }
        }
        const evaluation = await evaluations_repository_1.evaluationsRepository.create(finalInput, userId, resolvedSchoolId);
        await audit_service_1.auditService.log({
            schoolId: resolvedSchoolId,
            userId,
            action: 'CREATE_EVALUATION',
            entity: 'Evaluation',
            entityId: evaluation.id,
            details: { classId: finalInput.classId, moduleId: finalInput.moduleId }
        });
        return evaluation;
    },
    async getById(id, userRole, schoolId, scopedCampusIds) {
        const evaluation = await evaluations_repository_1.evaluationsRepository.findById(id, schoolId ?? null);
        if (!evaluation)
            throw new AppError_1.NotFoundError('Evaluation');
        if (scopedCampusIds &&
            scopedCampusIds.length > 0 &&
            evaluation.class?.campusId &&
            !scopedCampusIds.includes(evaluation.class.campusId)) {
            throw new AppError_1.ForbiddenError('You do not have access to this evaluation');
        }
        // Scrub evaluator if anonymous and requester is not admin
        if (evaluation.isAnonymous && !['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole || '')) {
            evaluation.evaluator = null;
            evaluation.evaluatorId = null;
        }
        return evaluation;
    },
    async getAll(query, userRole, schoolId, userCampusIds, userId) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            status: query.status,
            evaluatorId: (userRole === 'STUDENT' && userId) ? userId : query.evaluatorId,
            reportId: query.reportId,
            professorId: query.professorId,
            moduleId: query.moduleId,
            classId: query.classId,
            campusId: query.campusId,
            startDate: query.startDate,
            endDate: query.endDate,
            campaignId: query.campaignId,
        };
        const scopedCampusIds = this.resolveScopedCampusFilter(userRole, userCampusIds, filters.campusId);
        if (scopedCampusIds && scopedCampusIds.length > 0) {
            delete filters.campusId;
            filters.campusIds = scopedCampusIds;
        }
        const { items, total } = await evaluations_repository_1.evaluationsRepository.findAll(filters, pagination, schoolId ?? null);
        // Filter anonymous evaluators for non-admins
        if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole || '')) {
            items.forEach((item) => {
                if (item.isAnonymous) {
                    item.evaluator = null;
                    item.evaluatorId = null;
                }
            });
        }
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async update(id, input, userId, userRole, schoolId) {
        if (userRole === 'VIEWER')
            throw new AppError_1.ForbiddenError('VIEWER role is read-only');
        const evaluation = await evaluations_repository_1.evaluationsRepository.findById(id, schoolId ?? null);
        if (!evaluation)
            throw new AppError_1.NotFoundError('Evaluation');
        if (evaluation.evaluatorId !== userId && !['ADMIN', 'MANAGER', 'AGENT'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('You do not have permission to update this evaluation');
        }
        const result = await evaluations_repository_1.evaluationsRepository.update(id, input, schoolId ?? null);
        await audit_service_1.auditService.log({
            schoolId: schoolId,
            userId,
            action: 'UPDATE_EVALUATION',
            entity: 'Evaluation',
            entityId: id,
        });
        return result;
    },
    async delete(id, userRole, schoolId, userId) {
        if (userRole === 'VIEWER')
            throw new AppError_1.ForbiddenError('VIEWER role is read-only');
        if (!['ADMIN', 'MANAGER'].includes(userRole))
            throw new AppError_1.ForbiddenError('Only ADMIN or MANAGER can delete evaluations');
        const exists = await evaluations_repository_1.evaluationsRepository.existsById(id, schoolId ?? null);
        if (!exists)
            throw new AppError_1.NotFoundError('Evaluation');
        const result = await evaluations_repository_1.evaluationsRepository.delete(id, schoolId ?? null);
        await audit_service_1.auditService.log({
            schoolId: schoolId,
            userId,
            action: 'DELETE_EVALUATION',
            entity: 'Evaluation',
            entityId: id,
        });
        return result;
    },
    async getStats(query, schoolId, userRole, userCampusIds) {
        const filters = {
            reportId: query.reportId,
            professorId: query.professorId,
            moduleId: query.moduleId,
            classId: query.classId,
            campusId: query.campusId,
            startDate: query.startDate,
            endDate: query.endDate,
        };
        const scopedCampusIds = this.resolveScopedCampusFilter(userRole, userCampusIds, filters.campusId);
        if (scopedCampusIds && scopedCampusIds.length > 0) {
            delete filters.campusId;
            filters.campusIds = scopedCampusIds;
        }
        return evaluations_repository_1.evaluationsRepository.getAggregatedStats(filters, schoolId ?? null);
    },
    async triggerAiScoring(id, userRole, schoolId) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can trigger AI scoring');
        }
        const exists = await evaluations_repository_1.evaluationsRepository.existsById(id, schoolId ?? null);
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