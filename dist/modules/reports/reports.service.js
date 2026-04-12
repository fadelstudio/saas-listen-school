"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = void 0;
const reports_repository_1 = require("./reports.repository");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
const queue_1 = require("../../core/config/queue");
exports.reportsService = {
    async create(input, userId) {
        const report = await reports_repository_1.reportsRepository.create(input, userId);
        return report;
    },
    async getById(id) {
        const report = await reports_repository_1.reportsRepository.findById(id);
        if (!report)
            throw new AppError_1.NotFoundError('Report');
        return report;
    },
    async getAll(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            status: query.status,
            authorId: query.authorId,
            priority: query.priority,
            startDate: query.startDate,
            endDate: query.endDate,
            search: query.search,
        };
        const { items, total } = await reports_repository_1.reportsRepository.findAll(filters, pagination);
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
        await queue_1.jobQueue.add('ai-analysis', {
            type: 'report-analysis',
            reportId: id,
        });
        return { queued: true, reportId: id };
    },
};
//# sourceMappingURL=reports.service.js.map