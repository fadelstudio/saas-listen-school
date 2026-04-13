"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
exports.reportsRepository = {
    async getUserContext(userId) {
        return prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { classId: true, campusId: true },
        });
    },
    async create(data, authorId) {
        return prisma_1.prisma.report.create({
            data: {
                title: data.title,
                content: data.content,
                type: data.type ?? 'OTHER',
                priority: data.priority ?? 'MEDIUM',
                category: data.category,
                isAnonymous: data.isAnonymous ?? false,
                author: authorId ? { connect: { id: authorId } } : undefined,
                class: data.classId ? { connect: { id: data.classId } } : undefined,
                professor: data.professorId ? { connect: { id: data.professorId } } : undefined,
                module: data.moduleId ? { connect: { id: data.moduleId } } : undefined,
                status: client_1.ReportStatus.SUBMITTED,
            },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, email: true } },
                class: true,
                professor: true,
                module: true,
            },
        });
    },
    async findById(id) {
        return prisma_1.prisma.report.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, email: true } },
                class: true,
                professor: true,
                module: true,
                aiJobs: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
        });
    },
    async findAll(filters, pagination) {
        const where = {
            ...(filters.status && { status: filters.status }),
            ...(filters.authorId && { authorId: filters.authorId }),
            ...(filters.classId && { classId: filters.classId }),
            ...(filters.professorId && { professorId: filters.professorId }),
            ...(filters.moduleId && { moduleId: filters.moduleId }),
            ...(filters.priority && { priority: filters.priority }),
            ...(filters.isAnonymous !== undefined && { isAnonymous: filters.isAnonymous }),
            ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
            ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } }),
            ...(filters.search && {
                OR: [
                    { title: { contains: filters.search, mode: 'insensitive' } },
                    { content: { contains: filters.search, mode: 'insensitive' } },
                ],
            }),
        };
        const allowedSortFields = ['title', 'createdAt', 'priority', 'status'];
        const sortBy = allowedSortFields.includes(pagination.sortBy) ? pagination.sortBy : 'createdAt';
        const [items, total] = await Promise.all([
            prisma_1.prisma.report.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { [sortBy]: pagination.sortOrder },
                include: {
                    author: { select: { id: true, firstName: true, lastName: true, email: true } },
                    class: true,
                    professor: true,
                    module: true,
                },
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