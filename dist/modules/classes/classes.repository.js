"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classesRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.classesRepository = {
    async findAll(filters, pagination) {
        const where = {
            ...(filters.campusId && { campusId: filters.campusId }),
            ...(filters.levelId && { levelId: filters.levelId }),
            ...(filters.search && {
                name: { contains: filters.search, mode: 'insensitive' },
            }),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.class.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                include: {
                    campus: true,
                    academicLevel: true,
                    classModules: { include: { module: true } },
                    _count: { select: { users: true, reports: true } }
                },
            }),
            prisma_1.prisma.class.count({ where }),
        ]);
        return { items, total };
    },
    async findById(id) {
        return prisma_1.prisma.class.findUnique({
            where: { id },
            include: {
                campus: true,
                academicLevel: true,
                classModules: { include: { module: true, professors: true } },
                users: { select: { id: true, firstName: true, lastName: true, email: true } },
                reports: { take: 10, orderBy: { createdAt: 'desc' } },
            },
        });
    },
    async create(data) {
        return prisma_1.prisma.class.create({
            data,
            include: { campus: true, academicLevel: true },
        });
    },
    async update(id, data) {
        return prisma_1.prisma.class.update({
            where: { id },
            data,
            include: { campus: true, academicLevel: true },
        });
    },
    async delete(id) {
        return prisma_1.prisma.class.delete({
            where: { id },
        });
    },
    async findStudents(id) {
        return prisma_1.prisma.user.findMany({
            where: { classId: id, role: 'STUDENT' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                matricule: true,
                isActive: true,
                campusId: true,
            },
            orderBy: { lastName: 'asc' },
        });
    },
};
//# sourceMappingURL=classes.repository.js.map