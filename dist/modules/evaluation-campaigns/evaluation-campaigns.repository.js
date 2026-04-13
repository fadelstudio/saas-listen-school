"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationCampaignsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.evaluationCampaignsRepository = {
    async findAll(filters, pagination) {
        const where = {};
        if (filters.classId)
            where.classId = filters.classId;
        if (filters.status)
            where.status = filters.status;
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
                    _count: { select: { evaluations: true } }
                }
            }),
            prisma_1.prisma.evaluationCampaign.count({ where })
        ]);
        return { items, total };
    },
    async findById(id) {
        return prisma_1.prisma.evaluationCampaign.findUnique({
            where: { id },
            include: {
                class: {
                    include: { users: { select: { id: true } } }
                },
                module: true,
                professor: true,
                evaluations: true
            }
        });
    },
    async create(data) {
        return prisma_1.prisma.evaluationCampaign.create({
            data: {
                title: data.title,
                description: data.description,
                classId: data.classId,
                moduleId: data.moduleId,
                professorId: data.professorId,
                dueDate: data.dueDate,
                status: 'ACTIVE' // Start as active by default
            }
        });
    },
    async updateStatus(id, status) {
        return prisma_1.prisma.evaluationCampaign.update({
            where: { id },
            data: { status }
        });
    }
};
//# sourceMappingURL=evaluation-campaigns.repository.js.map