"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.aiRepository = {
    async createJob(data) {
        return prisma_1.prisma.aiJob.create({
            data: {
                jobType: data.jobType,
                status: data.status,
                payload: data.payload,
                reportId: data.reportId ?? null,
                evaluationId: data.evaluationId ?? null,
                decisionId: data.decisionId ?? null,
                errorMessage: data.errorMessage ?? null,
            },
        });
    },
    async findJobById(id, schoolId) {
        return prisma_1.prisma.aiJob.findFirst({
            where: {
                id,
                ...(schoolId
                    ? {
                        OR: [
                            { report: { schoolId } },
                            { evaluation: { schoolId } },
                            { decision: { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } },
                        ],
                    }
                    : {}),
            },
        });
    },
    async findJobs(filters, pagination, schoolId) {
        const where = {
            ...(schoolId
                ? {
                    OR: [
                        { report: { schoolId } },
                        { evaluation: { schoolId } },
                        { decision: { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } },
                    ],
                }
                : {}),
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