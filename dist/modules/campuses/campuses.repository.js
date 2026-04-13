"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campusesRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.campusesRepository = {
    async findAll(filters, pagination) {
        const where = {
            ...(filters.search && {
                name: { contains: filters.search, mode: 'insensitive' },
            }),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.campus.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                include: { _count: { select: { classes: true, users: true } } },
            }),
            prisma_1.prisma.campus.count({ where }),
        ]);
        return { items, total };
    },
    async findById(id) {
        return prisma_1.prisma.campus.findUnique({
            where: { id },
            include: {
                classes: { include: { _count: { select: { users: true } } } },
            },
        });
    },
    async create(data) {
        return prisma_1.prisma.campus.create({
            data,
        });
    },
    async update(id, data) {
        return prisma_1.prisma.campus.update({
            where: { id },
            data,
        });
    },
    async delete(id) {
        return prisma_1.prisma.campus.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=campuses.repository.js.map