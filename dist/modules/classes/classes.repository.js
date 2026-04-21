"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classesRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
const schoolScope = (schoolId) => ({
    campus: { schoolId },
});
exports.classesRepository = {
    async findAll(schoolId, filters, pagination) {
        const andParts = [schoolScope(schoolId)];
        if (filters.campusId)
            andParts.push({ campusId: filters.campusId });
        if (filters.levelId) {
            const levelBelongsToSchool = client_1.Prisma.validator()({
                schoolId,
            });
            andParts.push({
                levelId: filters.levelId,
                academicLevel: { is: levelBelongsToSchool },
            });
        }
        if (filters.search) {
            andParts.push({
                name: {
                    contains: filters.search,
                    mode: 'insensitive',
                },
            });
        }
        const where = { AND: andParts };
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
                    _count: { select: { users: true, reports: true } },
                },
            }),
            prisma_1.prisma.class.count({ where }),
        ]);
        return { items, total };
    },
    async findById(id, schoolId) {
        return prisma_1.prisma.class.findFirst({
            where: { id, ...schoolScope(schoolId) },
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
    async update(id, schoolId, data) {
        const row = await prisma_1.prisma.class.findFirst({ where: { id, ...schoolScope(schoolId) } });
        if (!row)
            return null;
        return prisma_1.prisma.class.update({
            where: { id },
            data,
            include: { campus: true, academicLevel: true },
        });
    },
    async delete(id, schoolId) {
        const row = await prisma_1.prisma.class.findFirst({ where: { id, ...schoolScope(schoolId) } });
        if (!row)
            return false;
        await prisma_1.prisma.class.delete({ where: { id } });
        return true;
    },
    async findStudents(classId, schoolId) {
        return prisma_1.prisma.user.findMany({
            where: {
                classId,
                role: 'STUDENT',
                schoolId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                matricule: true,
                isActive: true,
                campuses: { select: { id: true }, take: 1 },
            },
            orderBy: { lastName: 'asc' },
        });
    },
};
//# sourceMappingURL=classes.repository.js.map