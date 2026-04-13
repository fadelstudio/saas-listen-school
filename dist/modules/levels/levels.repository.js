"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.levelsRepository = {
    async findAll(pagination) {
        const [items, total] = await Promise.all([
            prisma_1.prisma.academicLevel.findMany({
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { order: 'asc' },
                include: { _count: { select: { classes: true } } },
            }),
            prisma_1.prisma.academicLevel.count(),
        ]);
        return { items, total };
    },
    async findById(id) {
        return prisma_1.prisma.academicLevel.findUnique({
            where: { id },
            include: { classes: true },
        });
    },
    async create(data) {
        const existing = await prisma_1.prisma.academicLevel.findUnique({
            where: { name: data.name },
        });
        if (existing)
            return existing;
        return prisma_1.prisma.academicLevel.create({
            data,
        });
    },
    async update(id, data) {
        return prisma_1.prisma.academicLevel.update({
            where: { id },
            data,
        });
    },
    async delete(id) {
        return prisma_1.prisma.academicLevel.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=levels.repository.js.map