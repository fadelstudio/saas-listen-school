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
                    { professor: { campus: { schoolId } } },
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
};
//# sourceMappingURL=evaluation-campaigns.repository.js.map