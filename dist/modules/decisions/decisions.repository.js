"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
exports.decisionsRepository = {
    async create(data, deciderId, _schoolId) {
        return prisma_1.prisma.decision.create({
            data: {
                evaluationId: data.evaluationId,
                reportId: data.reportId,
                deciderId,
                title: data.title,
                rationale: data.rationale,
                priority: data.priority ?? client_1.Priority.MEDIUM,
                responsible: data.responsible,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                status: client_1.DecisionStatus.PENDING,
            },
            include: {
                decider: { select: { id: true, firstName: true, lastName: true } },
                evaluation: { select: { id: true, score: true, status: true } },
                report: { select: { id: true, title: true, type: true } },
            },
        });
    },
    async findById(id, schoolId) {
        return prisma_1.prisma.decision.findFirst({
            where: {
                id,
                ...(schoolId
                    ? {
                        OR: [{ evaluation: { schoolId } }, { report: { schoolId } }],
                    }
                    : {}),
            },
            include: {
                decider: { select: { id: true, firstName: true, lastName: true, email: true } },
                evaluation: true,
                report: true,
                aiJobs: { orderBy: { createdAt: 'desc' }, take: 3 },
            },
        });
    },
    async findAll(filters, pagination, schoolId) {
        const where = {
            ...(schoolId
                ? {
                    OR: [{ evaluation: { schoolId } }, { report: { schoolId } }],
                }
                : {}),
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
    async update(id, data, schoolId) {
        const decision = await prisma_1.prisma.decision.findFirst({
            where: {
                id,
                ...(schoolId ? { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } : {}),
            },
            select: { id: true },
        });
        if (!decision)
            return null;
        return prisma_1.prisma.decision.update({
            where: { id: decision.id },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.rationale !== undefined && { rationale: data.rationale }),
                ...(data.priority !== undefined && { priority: data.priority }),
                ...(data.responsible !== undefined && { responsible: data.responsible }),
                ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
            },
        });
    },
    async updateStatus(id, status, schoolId) {
        const decision = await prisma_1.prisma.decision.findFirst({
            where: {
                id,
                ...(schoolId ? { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } : {}),
            },
            select: { id: true },
        });
        if (!decision)
            return null;
        return prisma_1.prisma.decision.update({ where: { id: decision.id }, data: { status } });
    },
    async delete(id, schoolId) {
        return prisma_1.prisma.decision.deleteMany({
            where: {
                id,
                ...(schoolId ? { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } : {}),
            },
        });
    },
    async existsById(id, schoolId) {
        return ((await prisma_1.prisma.decision.count({
            where: {
                id,
                ...(schoolId ? { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } : {}),
            },
        })) > 0);
    },
};
//# sourceMappingURL=decisions.repository.js.map