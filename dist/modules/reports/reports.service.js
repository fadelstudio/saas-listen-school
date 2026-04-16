"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = void 0;
const reports_repository_1 = require("./reports.repository");
const class_modules_repository_1 = require("../class-modules/class-modules.repository");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
const queue_1 = require("../../core/config/queue");
exports.reportsService = {
    async create(input, userId) {
        let finalInput = { ...input };
        // 1. Cross-validation using the Triple-Link structure
        if (finalInput.moduleId && finalInput.classId) {
            const assignment = await class_modules_repository_1.classModulesRepository.findByClassAndModule(finalInput.classId, finalInput.moduleId);
            if (!assignment) {
                throw new AppError_1.BadRequestError('This module is not assigned to the selected class');
            }
            if (finalInput.professorId) {
                const isAssigned = assignment.professors.some((p) => p.id === finalInput.professorId);
                if (!isAssigned) {
                    throw new AppError_1.BadRequestError('This professor is not assigned to this module for this class');
                }
            }
        }
        // 2. User Context auto-fill
        if (userId && !finalInput.classId) {
            const user = await reports_repository_1.reportsRepository.getUserContext(userId);
            if (user) {
                finalInput.classId = user.classId || undefined;
            }
        }
        const report = await reports_repository_1.reportsRepository.create(finalInput, userId);
        // 3. Automatic AI Trigger
        try {
            await queue_1.jobQueue.add('ai-analysis', {
                type: 'report-analysis',
                reportId: report.id,
            });
        }
        catch (error) {
            console.warn('⚠️ Could not auto-enqueue AI analysis (Redis down?):', error);
        }
        return report;
    },
    async getById(id, userRole) {
        const report = await reports_repository_1.reportsRepository.findById(id);
        if (!report)
            throw new AppError_1.NotFoundError('Report');
        // Scrub author if anonymous and requester is not admin
        if (report.isAnonymous && !['ADMIN', 'SUPERADMIN'].includes(userRole || '')) {
            report.author = null;
            report.authorId = null;
        }
        return report;
    },
    async getAll(query, userRole) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            status: query.status,
            authorId: query.authorId,
            campusId: query.campusId,
            classId: query.classId,
            professorId: query.professorId,
            moduleId: query.moduleId,
            priority: query.priority,
            startDate: query.startDate,
            endDate: query.endDate,
            search: query.search,
        };
        const { items, total } = await reports_repository_1.reportsRepository.findAll(filters, pagination);
        // Filter anonymous authors for non-admins
        if (!['ADMIN', 'SUPERADMIN'].includes(userRole || '')) {
            items.forEach((item) => {
                if (item.isAnonymous) {
                    item.author = null;
                    item.authorId = null;
                }
            });
        }
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async update(id, input, userId, userRole) {
        const report = await reports_repository_1.reportsRepository.findById(id);
        if (!report)
            throw new AppError_1.NotFoundError('Report');
        // Only the author or admin/manager can update
        if (report.authorId !== userId && !['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('You do not have permission to update this report');
        }
        return reports_repository_1.reportsRepository.update(id, input);
    },
    async updateStatus(id, status, userRole) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can change report status');
        }
        const exists = await reports_repository_1.reportsRepository.existsById(id);
        if (!exists)
            throw new AppError_1.NotFoundError('Report');
        return reports_repository_1.reportsRepository.updateStatus(id, status);
    },
    async delete(id, userRole) {
        if (userRole !== 'ADMIN') {
            throw new AppError_1.ForbiddenError('Only ADMIN can delete reports');
        }
        const exists = await reports_repository_1.reportsRepository.existsById(id);
        if (!exists)
            throw new AppError_1.NotFoundError('Report');
        return reports_repository_1.reportsRepository.delete(id);
    },
    async triggerAiAnalysis(id, userRole) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can trigger AI analysis');
        }
        const exists = await reports_repository_1.reportsRepository.existsById(id);
        if (!exists)
            throw new AppError_1.NotFoundError('Report');
        try {
            await queue_1.jobQueue.add('ai-analysis', {
                type: 'report-analysis',
                reportId: id,
            });
        }
        catch (error) {
            console.warn('⚠️ Could not enqueue AI report analysis (Redis down?):', error);
        }
        return { queued: true, reportId: id };
    },
};
//# sourceMappingURL=reports.service.js.map