"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
exports.reportsRepository = {
    async create(data, authorId) {
        return prisma_1.prisma.report.create({
            data: {
                title: data.title,
                content: data.content,
                authorId: authorId ?? null,
                status: client_1.ReportStatus.SUBMITTED,
            },
            include: { author: { select: { id: true, firstName: true, lastName: true, email: true } } },
        });
    },
    async findById(id) {
        return prisma_1.prisma.report.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, email: true } },
                aiJobs: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
        });
    },
    async findAll(filters, pagination) {
        const where = {
            ...(filters.status && { status: filters.status }),
            ...(filters.authorId && { authorId: filters.authorId }),
            ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
            ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } }),
            ...(filters.search && {
                OR: [
                    { title: { contains: filters.search, mode: 'insensitive' } },
                    { content: { contains: filters.search, mode: 'insensitive' } },
                ],
            }),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.report.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                include: { author: { select: { id: true, firstName: true, lastName: true } } },
            }),
            prisma_1.prisma.report.count({ where }),
        ]);
        return { items, total };
    },
    async update(id, data) {
        return prisma_1.prisma.report.update({
            where: { id },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.content !== undefined && { content: data.content }),
            },
        });
    },
    async updateStatus(id, status) {
        return prisma_1.prisma.report.update({ where: { id }, data: { status } });
    },
    async updateAiAnalysis(id, aiAnalysis) {
        return prisma_1.prisma.report.update({ where: { id }, data: { aiAnalysis } });
    },
    async delete(id) {
        return prisma_1.prisma.report.delete({ where: { id } });
    },
    async existsById(id) {
        const count = await prisma_1.prisma.report.count({ where: { id } });
        return count > 0;
    },
};
//# sourceMappingURL=reports.repository.js.map