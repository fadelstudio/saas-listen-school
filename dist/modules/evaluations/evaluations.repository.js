"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
exports.evaluationsRepository = {
    async getUserContext(userId) {
        return prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { classId: true, campusId: true },
        });
    },
    async create(data, evaluatorId) {
        return prisma_1.prisma.evaluation.create({
            data: {
                report: data.reportId ? { connect: { id: data.reportId } } : undefined,
                evaluator: evaluatorId ? { connect: { id: evaluatorId } } : undefined,
                professor: { connect: { id: data.professorId } },
                module: { connect: { id: data.moduleId } },
                class: { connect: { id: data.classId } },
                score: data.score,
                clarityScore: data.clarityScore,
                pedagogyScore: data.pedagogyScore,
                availabilityScore: data.availabilityScore,
                rhythmScore: data.rhythmScore,
                comment: data.comment,
                isAnonymous: data.isAnonymous ?? false,
                status: client_1.EvaluationStatus.PENDING,
            },
            include: {
                professor: true,
                module: true,
                class: true,
                evaluator: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    },
    async findById(id) {
        return prisma_1.prisma.evaluation.findUnique({
            where: { id },
            include: {
                evaluator: { select: { id: true, firstName: true, lastName: true, email: true } },
                report: { select: { id: true, title: true, status: true } },
                decision: true,
                aiJobs: { orderBy: { createdAt: 'desc' }, take: 3 },
            },
        });
    },
    async findAll(filters, pagination) {
        const where = {
            ...(filters.status && { status: filters.status }),
            ...(filters.evaluatorId && { evaluatorId: filters.evaluatorId }),
            ...(filters.reportId && { reportId: filters.reportId }),
            ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
            ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } }),
        };
        const allowedSortFields = ['score', 'createdAt', 'aiScore'];
        const sortBy = allowedSortFields.includes(pagination.sortBy) ? pagination.sortBy : 'createdAt';
        const [items, total] = await Promise.all([
            prisma_1.prisma.evaluation.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { [sortBy]: pagination.sortOrder },
                include: {
                    evaluator: { select: { id: true, firstName: true, lastName: true } },
                    report: { select: { id: true, title: true } },
                },
            }),
            prisma_1.prisma.evaluation.count({ where }),
        ]);
        return { items, total };
    },
    async update(id, data) {
        return prisma_1.prisma.evaluation.update({
            where: { id },
            data: {
                score: data.score,
                clarityScore: data.clarityScore,
                pedagogyScore: data.pedagogyScore,
                availabilityScore: data.availabilityScore,
                rhythmScore: data.rhythmScore,
                comment: data.comment,
            },
        });
    },
    async delete(id) {
        return prisma_1.prisma.evaluation.delete({ where: { id } });
    },
    async existsById(id) {
        return (await prisma_1.prisma.evaluation.count({ where: { id } })) > 0;
    },
    async updateAiScore(id, aiScore) {
        return prisma_1.prisma.evaluation.update({ where: { id }, data: { aiScore } });
    },
    async getAggregatedStats(filters) {
        const where = {
            ...(filters.reportId && { reportId: filters.reportId }),
            ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
            ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } }),
        };
        const agg = await prisma_1.prisma.evaluation.aggregate({
            where,
            _count: { id: true },
            _avg: {
                score: true,
                aiScore: true,
                clarityScore: true,
                pedagogyScore: true,
                availabilityScore: true,
                rhythmScore: true
            },
        });
        return {
            totalCount: agg._count.id,
            averageScore: agg._avg.score,
            averageClarityScore: agg._avg.clarityScore,
            averagePedagogyScore: agg._avg.pedagogyScore,
            averageAvailabilityScore: agg._avg.availabilityScore,
            averageRhythmScore: agg._avg.rhythmScore,
            distribution: {},
        };
    },
};
//# sourceMappingURL=evaluations.repository.js.map