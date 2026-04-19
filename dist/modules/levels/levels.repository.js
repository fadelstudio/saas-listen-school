"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const AppError_1 = require("../../core/errors/AppError");
const levelInSchool = (schoolId) => ({
    schoolId,
});
exports.levelsRepository = {
    async findAll(schoolId, pagination) {
        const where = levelInSchool(schoolId);
        const [items, total] = await Promise.all([
            prisma_1.prisma.academicLevel.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { order: 'asc' },
                include: { _count: { select: { classes: true } } },
            }),
            prisma_1.prisma.academicLevel.count({ where }),
        ]);
        return { items, total };
    },
    async findById(id, schoolId) {
        return prisma_1.prisma.academicLevel.findFirst({
            where: { id, ...levelInSchool(schoolId) },
            include: { classes: { where: { campus: { schoolId } } } },
        });
    },
    async create(schoolId, data) {
        const existing = await prisma_1.prisma.academicLevel.findUnique({
            where: { schoolId_name: { schoolId, name: data.name } },
        });
        if (existing)
            throw new AppError_1.ConflictError('A level with this name already exists in this school.');
        return prisma_1.prisma.academicLevel.create({
            data: {
                schoolId,
                name: data.name,
                order: data.order ?? 0,
            },
        });
    },
    async update(id, schoolId, data) {
        const row = await prisma_1.prisma.academicLevel.findFirst({ where: { id, ...levelInSchool(schoolId) } });
        if (!row)
            return null;
        if (data.name && data.name !== row.name) {
            const clash = await prisma_1.prisma.academicLevel.findUnique({
                where: { schoolId_name: { schoolId, name: data.name } },
            });
            if (clash)
                throw new AppError_1.ConflictError('A level with this name already exists in this school.');
        }
        return prisma_1.prisma.academicLevel.update({
            where: { id },
            data,
        });
    },
    async delete(id, schoolId) {
        const row = await prisma_1.prisma.academicLevel.findFirst({ where: { id, ...levelInSchool(schoolId) } });
        if (!row)
            return false;
        await prisma_1.prisma.academicLevel.delete({ where: { id } });
        return true;
    },
};
//# sourceMappingURL=levels.repository.js.map