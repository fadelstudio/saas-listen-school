"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.aiRepository = {
    async findJobById(id) {
        return prisma_1.prisma.aiJob.findUnique({ where: { id } });
    },
    async findJobs(filters, pagination) {
        const where = {
            ...(filters.status && { status: filters.status }),
            ...(filters.jobType && { jobType: filters.jobType }),
            ...(filters.reportId && { reportId: filters.reportId }),
            ...(filters.evaluationId && { evaluationId: filters.evaluationId }),
            ...(filters.decisionId && { decisionId: filters.decisionId }),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.aiJob.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.aiJob.count({ where }),
        ]);
        return { items, total };
    },
    async updateJobStatus(id, status, result, errorMessage) {
        return prisma_1.prisma.aiJob.update({
            where: { id },
            data: { status, result, errorMessage },
        });
    },
};
//# sourceMappingURL=ai.repository.js.map