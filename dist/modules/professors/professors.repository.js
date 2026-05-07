"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorsRepository = void 0;
exports.professorInSchool = professorInSchool;
const prisma_1 = require("../../core/database/prisma");
/**
 * Filtre les professeurs appartenant à une école donnée.
 * Un professeur appartient à l'école si son schoolId correspond.
 */
function professorInSchool(schoolId) {
    return { schoolId };
}
exports.professorsRepository = {
    async findAll(schoolId, filters, pagination) {
        const andParts = [professorInSchool(schoolId)];
        if (filters.search) {
            andParts.push({
                OR: [
                    { firstName: { contains: filters.search, mode: 'insensitive' } },
                    { lastName: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                    { matricule: { contains: filters.search, mode: 'insensitive' } },
                    { numero: { contains: filters.search, mode: 'insensitive' } },
                ],
            });
        }
        if (filters.classId) {
            andParts.push({
                modules: {
                    some: {
                        classId: filters.classId,
                    },
                },
            });
        }
        if (filters.campusId) {
            andParts.push({
                modules: {
                    some: {
                        class: { campusId: filters.campusId },
                    },
                },
            });
        }
        if (filters.campusIds && filters.campusIds.length > 0) {
            andParts.push({
                modules: {
                    some: {
                        class: { campusId: { in: filters.campusIds } },
                    },
                },
            });
        }
        const where = { AND: andParts };
        const [items, total] = await Promise.all([
            prisma_1.prisma.professor.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                include: {
                    user: { select: { id: true, avatarPath: true } },
                    _count: { select: { evaluations: true } },
                    modules: { select: { moduleId: true } },
                },
            }),
            prisma_1.prisma.professor.count({ where }),
        ]);
        return { items, total };
    },
    async findById(id, schoolId) {
        return prisma_1.prisma.professor.findFirst({
            where: { id, ...professorInSchool(schoolId) },
            include: {
                user: { select: { id: true, avatarPath: true } },
                evaluations: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: { module: true, class: { select: { campusId: true } } },
                },
            },
        });
    },
    async create(data) {
        return prisma_1.prisma.professor.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                userId: data.userId,
                schoolId: data.schoolId,
                matricule: data.matricule ?? null,
                numero: data.numero ?? null,
                phone: data.phone ?? null,
            },
            include: {
                user: { select: { id: true, avatarPath: true } },
                _count: { select: { evaluations: true } },
            },
        });
    },
    async update(id, schoolId, data) {
        const row = await prisma_1.prisma.professor.findFirst({ where: { id, ...professorInSchool(schoolId) } });
        if (!row)
            return null;
        return prisma_1.prisma.professor.update({
            where: { id },
            data,
            include: {
                user: { select: { id: true, avatarPath: true } },
                _count: { select: { evaluations: true } },
            },
        });
    },
    async delete(id, schoolId) {
        const row = await prisma_1.prisma.professor.findFirst({ where: { id, ...professorInSchool(schoolId) } });
        if (!row)
            return false;
        await prisma_1.prisma.professor.delete({ where: { id } });
        return true;
    },
};
//# sourceMappingURL=professors.repository.js.map