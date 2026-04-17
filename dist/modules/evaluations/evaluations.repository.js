"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
const evaluations_scoring_1 = require("./evaluations.scoring");
const AppError_1 = require("../../core/errors/AppError");
function mergeRatings(existing, patch) {
    return {
        comprehensionRating: patch.comprehensionRating ?? existing.comprehensionRating,
        explanationRating: patch.explanationRating ?? existing.explanationRating,
        pedagogyRating: patch.pedagogyRating ?? existing.pedagogyRating,
        availabilityRating: patch.availabilityRating ?? existing.availabilityRating,
        rhythmRating: patch.rhythmRating ?? existing.rhythmRating,
    };
}
exports.evaluationsRepository = {
    async getUserContext(userId) {
        return prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { classId: true, campusId: true },
        });
    },
    async create(data, evaluatorId, schoolId) {
        if (!data.comprehensionRating ||
            !data.explanationRating ||
            !data.pedagogyRating ||
            !data.availabilityRating ||
            !data.rhythmRating) {
            throw new AppError_1.BadRequestError('All five rating fields (comprehension, explanation, pedagogy, availability, rhythm) are required');
        }
        const ratings = {
            comprehensionRating: data.comprehensionRating,
            explanationRating: data.explanationRating,
            pedagogyRating: data.pedagogyRating,
            availabilityRating: data.availabilityRating,
            rhythmRating: data.rhythmRating,
        };
        const score = (0, evaluations_scoring_1.computeScoreFromRatings)(ratings);
        return prisma_1.prisma.evaluation.create({
            data: {
                report: data.reportId ? { connect: { id: data.reportId } } : undefined,
                evaluator: evaluatorId ? { connect: { id: evaluatorId } } : undefined,
                professor: { connect: { id: data.professorId } },
                module: { connect: { id: data.moduleId } },
                class: { connect: { id: data.classId } },
                school: schoolId ? { connect: { id: schoolId } } : undefined,
                score,
                comprehensionRating: data.comprehensionRating,
                explanationRating: data.explanationRating,
                pedagogyRating: data.pedagogyRating,
                availabilityRating: data.availabilityRating,
                rhythmRating: data.rhythmRating,
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
    async findById(id, schoolId) {
        return prisma_1.prisma.evaluation.findFirst({
            where: { id, ...(schoolId ? { schoolId } : {}) },
            include: {
                evaluator: { select: { id: true, firstName: true, lastName: true, email: true } },
                report: { select: { id: true, title: true, status: true } },
                decision: true,
                aiJobs: { orderBy: { createdAt: 'desc' }, take: 3 },
            },
        });
    },
    async findAll(filters, pagination, schoolId) {
        const where = {
            ...(schoolId ? { schoolId } : {}),
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
    async update(id, data, schoolId) {
        const existing = await prisma_1.prisma.evaluation.findFirst({ where: { id, ...(schoolId ? { schoolId } : {}) } });
        if (!existing) {
            throw new AppError_1.NotFoundError('Evaluation');
        }
        const merged = mergeRatings(existing, data);
        let score;
        if ((0, evaluations_scoring_1.hasAllRatings)(merged)) {
            score = (0, evaluations_scoring_1.computeScoreFromRatings)(merged);
        }
        return prisma_1.prisma.evaluation.update({
            where: { id: existing.id },
            data: {
                comprehensionRating: data.comprehensionRating,
                explanationRating: data.explanationRating,
                pedagogyRating: data.pedagogyRating,
                availabilityRating: data.availabilityRating,
                rhythmRating: data.rhythmRating,
                comment: data.comment,
                ...(score !== undefined ? { score } : {}),
            },
        });
    },
    async delete(id, schoolId) {
        return prisma_1.prisma.evaluation.deleteMany({ where: { id, ...(schoolId ? { schoolId } : {}) } });
    },
    async existsById(id, schoolId) {
        return (await prisma_1.prisma.evaluation.count({ where: { id, ...(schoolId ? { schoolId } : {}) } })) > 0;
    },
    async updateAiScore(id, aiScore) {
        return prisma_1.prisma.evaluation.update({ where: { id }, data: { aiScore } });
    },
    async getAggregatedStats(filters, schoolId) {
        const where = {
            ...(schoolId ? { schoolId } : {}),
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
            },
        });
        return {
            totalCount: agg._count.id,
            averageScore: agg._avg.score,
            averageAiScore: agg._avg.aiScore,
        };
    },
};
//# sourceMappingURL=evaluations.repository.js.map