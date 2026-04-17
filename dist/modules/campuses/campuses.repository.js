"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campusesRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
exports.campusesRepository = {
    async findAll(schoolId, filters, pagination) {
        const where = {
            schoolId,
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
    async findById(id, schoolId) {
        return prisma_1.prisma.campus.findFirst({
            where: { id, schoolId },
            include: {
                classes: { include: { _count: { select: { users: true } } } },
            },
        });
    },
    async create(data) {
        try {
            return await prisma_1.prisma.campus.create({
                data,
            });
        }
        catch (error) {
            // Legacy single-school DB: campuses table may not have schoolId.
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2022') {
                const { schoolId: _ignored, ...legacyData } = data;
                return prisma_1.prisma.campus.create({
                    data: legacyData,
                });
            }
            throw error;
        }
    },
    async update(id, data, schoolId) {
        const existing = await prisma_1.prisma.campus.findFirst({ where: { id, schoolId }, select: { id: true } });
        if (!existing)
            return null;
        return prisma_1.prisma.campus.update({
            where: { id: existing.id },
            data,
        });
    },
    async delete(id, schoolId) {
        const existing = await prisma_1.prisma.campus.findFirst({ where: { id, schoolId }, select: { id: true } });
        if (!existing)
            return null;
        return prisma_1.prisma.campus.delete({
            where: { id: existing.id },
        });
    },
    async findClasses(id, schoolId) {
        return prisma_1.prisma.class.findMany({
            where: { campusId: id, campus: { schoolId } },
            include: {
                academicLevel: true,
                _count: { select: { users: true } },
            },
            orderBy: { academicLevel: { order: 'asc' } },
        });
    },
    async findStudents(id, schoolId) {
        return prisma_1.prisma.user.findMany({
            where: { campusId: id, role: 'STUDENT', schoolId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                matricule: true,
                isActive: true,
                classId: true,
                class: { select: { name: true } },
            },
            orderBy: { lastName: 'asc' },
        });
    },
    async getStats(id, schoolId) {
        const [classes, students, professors] = await Promise.all([
            prisma_1.prisma.class.count({ where: { campusId: id, campus: { schoolId } } }),
            prisma_1.prisma.user.count({ where: { campusId: id, role: 'STUDENT', schoolId } }),
            prisma_1.prisma.professor.count({ where: { campusId: id, campus: { schoolId } } }),
        ]);
        return { classes, students, professors };
    },
    async findProfessors(id, schoolId) {
        return prisma_1.prisma.professor.findMany({
            where: { campusId: id, campus: { schoolId } },
            include: {
                _count: { select: { evaluations: true } },
            },
            orderBy: { lastName: 'asc' },
        });
    },
};
//# sourceMappingURL=campuses.repository.js.map