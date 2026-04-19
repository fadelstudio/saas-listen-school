"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.academicModulesRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const AppError_1 = require("../../core/errors/AppError");
const moduleInSchool = (schoolId) => ({ schoolId });
exports.academicModulesRepository = {
    async findAll(schoolId, filters, pagination) {
        const where = {
            AND: [
                moduleInSchool(schoolId),
                ...(filters.search
                    ? [
                        {
                            OR: [
                                {
                                    name: {
                                        contains: filters.search,
                                        mode: 'insensitive',
                                    },
                                },
                                {
                                    code: {
                                        contains: filters.search,
                                        mode: 'insensitive',
                                    },
                                },
                            ],
                        },
                    ]
                    : []),
            ],
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
                    _count: { select: { classModules: true, reports: true, evaluations: true } },
                },
            }),
            prisma_1.prisma.module.count({ where }),
        ]);
        return { items, total };
    },
    async findById(id, schoolId) {
        return prisma_1.prisma.module.findFirst({
            where: { id, ...moduleInSchool(schoolId) },
            include: {
                classModules: { include: { class: true, professors: true } },
                evaluations: { take: 10, orderBy: { createdAt: 'desc' }, include: { evaluator: true } },
            },
        });
    },
    async create(schoolId, data) {
        const dup = await prisma_1.prisma.module.findUnique({
            where: { schoolId_name: { schoolId, name: data.name } },
        });
        if (dup)
            throw new AppError_1.ConflictError('A module with this name already exists in this school.');
        return prisma_1.prisma.module.create({
            data: {
                schoolId,
                name: data.name,
                code: data.code ?? null,
            },
            include: { _count: { select: { classModules: true } } },
        });
    },
    async update(id, schoolId, data) {
        const row = await prisma_1.prisma.module.findFirst({ where: { id, ...moduleInSchool(schoolId) } });
        if (!row)
            return null;
        if (data.name && data.name !== row.name) {
            const clash = await prisma_1.prisma.module.findUnique({
                where: { schoolId_name: { schoolId, name: data.name } },
            });
            if (clash)
                throw new AppError_1.ConflictError('A module with this name already exists in this school.');
        }
        return prisma_1.prisma.module.update({
            where: { id },
            data: {
                name: data.name,
                code: data.code ?? undefined,
            },
        });
    },
    async delete(id, schoolId) {
        const row = await prisma_1.prisma.module.findFirst({ where: { id, ...moduleInSchool(schoolId) } });
        if (!row)
            return false;
        await prisma_1.prisma.module.delete({ where: { id } });
        return true;
    },
};
//# sourceMappingURL=academic-modules.repository.js.map