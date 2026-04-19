"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorsRepository = void 0;
exports.professorInSchool = professorInSchool;
const prisma_1 = require("../../core/database/prisma");
/** Prof rattaché à l’école : campus dans l’école OU aucun campus (= tous les campus). */
function professorInSchool(schoolId) {
    return {
        OR: [{ campusId: null }, { campus: { schoolId } }],
    };
}
exports.professorsRepository = {
    async findAll(schoolId, filters, pagination) {
        const andParts = [professorInSchool(schoolId)];
        if (filters.campusId) {
            andParts.push({
                OR: [{ campusId: null }, { campusId: filters.campusId }],
            });
        }
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
        const where = { AND: andParts };
        const [items, total] = await Promise.all([
            prisma_1.prisma.professor.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                include: {
                    campus: { select: { id: true, name: true, code: true } },
                    user: { select: { id: true, avatarPath: true } },
                    _count: { select: { evaluations: true } },
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
                campus: { select: { id: true, name: true, code: true } },
                user: { select: { id: true, avatarPath: true } },
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
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                userId: data.userId,
                campusId: data.campusId,
                matricule: data.matricule ?? null,
                numero: data.numero ?? null,
                phone: data.phone ?? null,
            },
            include: {
                campus: { select: { id: true, name: true, code: true } },
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
                campus: { select: { id: true, name: true, code: true } },
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