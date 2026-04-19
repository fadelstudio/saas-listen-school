"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationCampaignsRepository = void 0;
exports.campaignInSchool = campaignInSchool;
const prisma_1 = require("../../core/database/prisma");
/** Campagne rattachée au tenant : par classe, campus, ou portée école avec prof du campus. */
function campaignInSchool(schoolId) {
    return {
        OR: [
            {
                AND: [
                    { scope: 'CLASS' },
                    { class: { campus: { schoolId } } },
                ],
            },
            {
                AND: [
                    { scope: 'CAMPUS' },
                    { campus: { schoolId } },
                ],
            },
            {
                AND: [
                    { scope: 'SCHOOL' },
                    { module: { schoolId } },
                ],
            },
        ],
    };
}
exports.evaluationCampaignsRepository = {
    async findAll(schoolId, filters, pagination) {
        const tenant = campaignInSchool(schoolId);
        const where = {
            AND: [
                tenant,
                ...(filters.classId ? [{ classId: filters.classId }] : []),
                ...(filters.campusId ? [{ campusId: filters.campusId }] : []),
                ...(filters.scope ? [{ scope: filters.scope }] : []),
                ...(filters.status ? [{ status: filters.status }] : []),
            ],
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.evaluationCampaign.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    class: true,
                    module: true,
                    professor: true,
                    _count: { select: { evaluations: true } },
                },
            }),
            prisma_1.prisma.evaluationCampaign.count({ where }),
        ]);
        return { items, total };
    },
    async findById(id, schoolId) {
        return prisma_1.prisma.evaluationCampaign.findFirst({
            where: { id, ...campaignInSchool(schoolId) },
            include: {
                class: {
                    include: { users: { select: { id: true } } },
                },
                campus: {
                    include: { users: { select: { id: true, role: true } } },
                },
                module: true,
                professor: true,
                evaluations: true,
            },
        });
    },
    async create(data) {
        return prisma_1.prisma.evaluationCampaign.create({
            data: {
                title: data.title,
                description: data.description,
                scope: data.scope,
                classId: data.classId,
                campusId: data.campusId,
                moduleId: data.moduleId,
                professorId: data.professorId,
                dueDate: data.dueDate,
                status: 'ACTIVE',
            },
        });
    },
    async updateStatus(id, schoolId, status) {
        const row = await prisma_1.prisma.evaluationCampaign.findFirst({
            where: { id, ...campaignInSchool(schoolId) },
        });
        if (!row)
            return null;
        return prisma_1.prisma.evaluationCampaign.update({
            where: { id },
            data: { status },
        });
    },
    async getAnalytics(id, schoolId) {
        const campaign = await prisma_1.prisma.evaluationCampaign.findFirst({
            where: { id, ...campaignInSchool(schoolId) },
            include: {
                class: { include: { users: { where: { role: 'STUDENT' }, select: { id: true } } } },
                campus: { include: { users: { where: { role: 'STUDENT' }, select: { id: true } } } },
                _count: { select: { evaluations: true } },
                evaluations: {
                    select: { score: true, aiScore: true, createdAt: true },
                    orderBy: { createdAt: 'desc' },
                },
                module: true,
                professor: true,
            },
        });
        if (!campaign)
            return null;
        let totalExpected = 0;
        if (campaign.scope === 'CLASS') {
            totalExpected = campaign.class?.users.length || 0;
        }
        else if (campaign.scope === 'CAMPUS') {
            totalExpected = campaign.campus?.users.length || 0;
        }
        else if (campaign.scope === 'SCHOOL') {
            totalExpected = await prisma_1.prisma.user.count({ where: { role: 'STUDENT', schoolId } });
        }
        const totalDone = campaign._count.evaluations;
        const completionRate = totalExpected > 0 ? (totalDone / totalExpected) * 100 : 0;
        const avgScore = campaign.evaluations.reduce((acc, curr) => acc + (curr.score || 0), 0) / (totalDone || 1);
        const avgAiScore = campaign.evaluations.reduce((acc, curr) => acc + (curr.aiScore || 0), 0) / (totalDone || 1);
        // Get the decision if it exists
        const decision = await prisma_1.prisma.decision.findUnique({
            where: { campaignId: id },
            include: { decider: { select: { firstName: true, lastName: true } } },
        });
        return {
            campaign,
            stats: {
                totalExpected,
                totalDone,
                completionRate: Number(completionRate.toFixed(1)),
                avgScore: Number(avgScore.toFixed(1)),
                avgAiScore: Number(avgAiScore.toFixed(1)),
            },
            decision,
        };
    },
};
//# sourceMappingURL=evaluation-campaigns.repository.js.map