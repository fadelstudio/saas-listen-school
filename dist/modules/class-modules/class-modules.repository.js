"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classModulesRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const classModuleInSchool = (schoolId) => ({
    class: { campus: { schoolId } },
});
exports.classModulesRepository = {
    async findAll(schoolId, filters) {
        return prisma_1.prisma.classModule.findMany({
            where: {
                AND: [
                    classModuleInSchool(schoolId),
                    ...(filters.classId ? [{ classId: filters.classId }] : []),
                    ...(filters.moduleId ? [{ moduleId: filters.moduleId }] : []),
                ],
            },
            include: {
                class: true,
                module: true,
                professors: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { class: { name: 'asc' } },
        });
    },
    async findById(id, schoolId) {
        return prisma_1.prisma.classModule.findFirst({
            where: { id, ...classModuleInSchool(schoolId) },
            include: {
                class: true,
                module: true,
                professors: true,
            },
        });
    },
    async findByClassAndModule(classId, moduleId, schoolId) {
        return prisma_1.prisma.classModule.findFirst({
            where: {
                AND: [
                    { classId, moduleId },
                    classModuleInSchool(schoolId),
                ],
            },
            include: { professors: true },
        });
    },
    async create(data) {
        const { professorIds, classId, moduleId } = data;
        return prisma_1.prisma.classModule.create({
            data: {
                class: { connect: { id: classId } },
                module: { connect: { id: moduleId } },
                professors: professorIds ? { connect: professorIds.map((pid) => ({ id: pid })) } : undefined,
            },
            include: { class: true, module: true, professors: true },
        });
    },
    async update(id, schoolId, data) {
        const row = await prisma_1.prisma.classModule.findFirst({ where: { id, ...classModuleInSchool(schoolId) } });
        if (!row)
            return null;
        return prisma_1.prisma.classModule.update({
            where: { id },
            data: {
                professors: data.professorIds ? { set: data.professorIds.map((pid) => ({ id: pid })) } : undefined,
            },
            include: { class: true, module: true, professors: true },
        });
    },
    async delete(id, schoolId) {
        const row = await prisma_1.prisma.classModule.findFirst({ where: { id, ...classModuleInSchool(schoolId) } });
        if (!row)
            return false;
        await prisma_1.prisma.classModule.delete({ where: { id } });
        return true;
    },
};
//# sourceMappingURL=class-modules.repository.js.map