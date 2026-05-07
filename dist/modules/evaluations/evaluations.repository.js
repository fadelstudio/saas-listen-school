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
            select: { classId: true },
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
                // ── Rattachement de la campagne ──────────────────────────────────────
                campaign: data.campaignId ? { connect: { id: data.campaignId } } : undefined,
                score,
                comprehensionRating: data.comprehensionRating,
                explanationRating: data.explanationRating,
                pedagogyRating: data.pedagogyRating,
                availabilityRating: data.availabilityRating,
                rhythmRating: data.rhythmRating,
                comment: data.comment,
                isAnonymous: data.isAnonymous ?? false,
                status: client_1.EvaluationStatus.PENDING,
                deviceMetadata: data.uti ? { uti: data.uti, ...(data.deviceMetadata || {}) } : data.deviceMetadata,
            },
            include: {
                professor: true,
                module: true,
                class: true,
                campaign: { select: { id: true, title: true } },
                evaluator: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    },
    async findById(id, schoolId) {
        return prisma_1.prisma.evaluation.findFirst({
            where: { id, ...(schoolId ? { schoolId } : {}) },
            include: {
                evaluator: { select: { id: true, firstName: true, lastName: true, email: true } },
                professor: true,
                module: true,
                class: true,
                campaign: { select: { id: true, title: true } },
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
            ...(filters.professorId && { professorId: filters.professorId }),
            ...(filters.moduleId && { moduleId: filters.moduleId }),
            ...(filters.classId && { classId: filters.classId }),
            ...(filters.campusIds && filters.campusIds.length > 0 ? { class: { campusId: { in: filters.campusIds } } } : {}),
            ...(filters.campusId && { class: { campusId: filters.campusId } }),
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
                    professor: { select: { id: true, firstName: true, lastName: true, matricule: true } },
                    module: { select: { id: true, name: true, code: true } },
                    class: { select: { id: true, name: true } },
                    campaign: { select: { id: true, title: true } },
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
            ...(filters.professorId && { professorId: filters.professorId }),
            ...(filters.moduleId && { moduleId: filters.moduleId }),
            ...(filters.classId && { classId: filters.classId }),
            ...(filters.campusIds && filters.campusIds.length > 0 ? { class: { campusId: { in: filters.campusIds } } } : {}),
            ...(filters.campusId && { class: { campusId: filters.campusId } }),
            ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
            ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } }),
        };
        const [agg, profStats] = await Promise.all([
            prisma_1.prisma.evaluation.aggregate({
                where,
                _count: { id: true },
                _avg: {
                    score: true,
                    aiScore: true,
                },
            }),
            prisma_1.prisma.evaluation.groupBy({
                by: ['professorId'],
                where,
                _avg: { score: true },
                _count: { id: true },
                orderBy: { _avg: { score: 'desc' } },
                take: 10, // Fetch top 10 to slice top 5 and bottom 5 if needed
            }),
        ]);
        // Fetch professor names for rankings
        const profIds = profStats.map(s => s.professorId);
        const professors = await prisma_1.prisma.professor.findMany({
            where: { id: { in: profIds } },
            select: { id: true, firstName: true, lastName: true },
        });
        const profMap = new Map(professors.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
        const allRankings = profStats.map(s => ({
            name: profMap.get(s.professorId) || 'Inconnu',
            role: 'Professeur',
            score: Number((s._avg.score || 0).toFixed(1)),
            count: s._count.id,
        }));
        // Calculate criteria averages (mapping Enums to scores)
        const criteriaScores = await prisma_1.prisma.evaluation.findMany({
            where,
            select: {
                comprehensionRating: true,
                explanationRating: true,
                pedagogyRating: true,
                availabilityRating: true,
                rhythmRating: true,
                aiScore: true,
            },
        });
        const ratingToScore = {
            VERY_POOR: 4,
            POOR: 8,
            FAIR: 12,
            GOOD: 16,
            EXCELLENT: 20,
        };
        const sum = (key) => criteriaScores.reduce((acc, curr) => acc + (ratingToScore[curr[key]] || 0), 0);
        const count = criteriaScores.length || 1;
        // Calculate sentiment distribution based on AI scores
        const aiScores = criteriaScores
            .map(e => e.aiScore)
            .filter((s) => typeof s === 'number');
        const totalAi = aiScores.length || 1;
        const positive = aiScores.filter(s => s >= 15).length;
        const neutral = aiScores.filter(s => s >= 10 && s < 15).length;
        const negative = aiScores.filter(s => s < 10).length;
        return {
            totalCount: agg._count.id,
            averageScore: agg._avg.score,
            averageAiScore: agg._avg.aiScore,
            avgComprehension: Number((sum('comprehensionRating') / count).toFixed(1)),
            avgExplanation: Number((sum('explanationRating') / count).toFixed(1)),
            avgPedagogy: Number((sum('pedagogyRating') / count).toFixed(1)),
            avgAvailability: Number((sum('availabilityRating') / count).toFixed(1)),
            avgRhythm: Number((sum('rhythmRating') / count).toFixed(1)),
            sentimentDistribution: {
                positive: Math.round((positive / totalAi) * 100),
                neutral: Math.round((neutral / totalAi) * 100),
                negative: Math.round((negative / totalAi) * 100),
            },
            rankings: {
                top: allRankings.slice(0, 5),
                bottom: [...allRankings].reverse().slice(0, 5),
            },
        };
    },
};
//# sourceMappingURL=evaluations.repository.js.map