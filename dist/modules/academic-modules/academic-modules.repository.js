"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.academicModulesRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.academicModulesRepository = {
    async findAll(filters, pagination) {
        const where = {
            ...(filters.search && {
                OR: [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { code: { contains: filters.search, mode: 'insensitive' } },
                ],
            }),
        };
        const allowedSortFields = ['name', 'code', 'createdAt'];
        const sortBy = allowedSortFields.includes(pagination.sortBy) ? pagination.sortBy : 'createdAt';
        const [items, total] = await Promise.all([
            prisma_1.prisma.module.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { [sortBy]: pagination.sortOrder },
                include: {
                    _count: { select: { classModules: true, reports: true, evaluations: true } }
                },
            }),
            prisma_1.prisma.module.count({ where }),
        ]);
        return { items, total };
    },
    async findById(id) {
        return prisma_1.prisma.module.findUnique({
            where: { id },
            include: {
                classModules: { include: { class: true, professors: true } },
                evaluations: { take: 10, orderBy: { createdAt: 'desc' }, include: { evaluator: true } },
            },
        });
    },
    async create(data) {
        return prisma_1.prisma.module.create({
            data: {
                name: data.name,
                code: data.code ?? null,
            },
            include: { _count: { select: { classModules: true } } },
        });
    },
    async update(id, data) {
        return prisma_1.prisma.module.update({
            where: { id },
            data: {
                name: data.name,
                code: data.code ?? undefined,
            },
        });
    },
    async delete(id) {
        return prisma_1.prisma.module.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=academic-modules.repository.js.map