"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
exports.decisionsRepository = {
    async create(data, deciderId) {
        return prisma_1.prisma.decision.create({
            data: {
                evaluationId: data.evaluationId,
                deciderId,
                rationale: data.rationale,
                status: client_1.DecisionStatus.PENDING,
            },
            include: {
                decider: { select: { id: true, firstName: true, lastName: true } },
                evaluation: { select: { id: true, score: true, status: true } },
            },
        });
    },
    async findById(id) {
        return prisma_1.prisma.decision.findUnique({
            where: { id },
            include: {
                decider: { select: { id: true, firstName: true, lastName: true, email: true } },
                evaluation: true,
                aiJobs: { orderBy: { createdAt: 'desc' }, take: 3 },
            },
        });
    },
    async findAll(filters, pagination) {
        const where = {
            ...(filters.status && { status: filters.status }),
            ...(filters.deciderId && { deciderId: filters.deciderId }),
            ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
            ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } }),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.decision.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                include: {
                    decider: { select: { id: true, firstName: true, lastName: true } },
                },
            }),
            prisma_1.prisma.decision.count({ where }),
        ]);
        return { items, total };
    },
    async update(id, data) {
        return prisma_1.prisma.decision.update({
            where: { id },
            data: {
                ...(data.rationale !== undefined && { rationale: data.rationale }),
                ...(data.title !== undefined && { aiSuggestion: data.title }),
            },
        });
    },
    async updateStatus(id, status) {
        return prisma_1.prisma.decision.update({ where: { id }, data: { status } });
    },
    async delete(id) {
        return prisma_1.prisma.decision.delete({ where: { id } });
    },
    async existsById(id) {
        return (await prisma_1.prisma.decision.count({ where: { id } })) > 0;
    },
};
//# sourceMappingURL=decisions.repository.js.map