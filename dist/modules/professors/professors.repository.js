"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.professorsRepository = {
    async findAll(filters, pagination) {
        const where = {
            ...(filters.campusId && { campusId: filters.campusId }),
            ...(filters.search && {
                OR: [
                    { firstName: { contains: filters.search, mode: 'insensitive' } },
                    { lastName: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                ],
            }),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.professor.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                include: { _count: { select: { evaluations: true } } },
            }),
            prisma_1.prisma.professor.count({ where }),
        ]);
        return { items, total };
    },
    async findById(id) {
        return prisma_1.prisma.professor.findUnique({
            where: { id },
            include: {
                evaluations: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: { module: true },
                },
            },
        });
    },
    async create(data) {
        return prisma_1.prisma.professor.create({
            data,
        });
    },
    async update(id, data) {
        return prisma_1.prisma.professor.update({
            where: { id },
            data,
        });
    },
    async delete(id) {
        return prisma_1.prisma.professor.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=professors.repository.js.map