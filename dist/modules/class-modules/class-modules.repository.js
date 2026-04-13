"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classModulesRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.classModulesRepository = {
    async findAll(filters) {
        return prisma_1.prisma.classModule.findMany({
            where: {
                ...(filters.classId && { classId: filters.classId }),
                ...(filters.moduleId && { moduleId: filters.moduleId }),
            },
            include: {
                class: true,
                module: true,
                professors: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { class: { name: 'asc' } },
        });
    },
    async findById(id) {
        return prisma_1.prisma.classModule.findUnique({
            where: { id },
            include: {
                class: true,
                module: true,
                professors: true,
            },
        });
    },
    async findByClassAndModule(classId, moduleId) {
        return prisma_1.prisma.classModule.findUnique({
            where: { classId_moduleId: { classId, moduleId } },
            include: { professors: true },
        });
    },
    async create(data) {
        const { professorIds, classId, moduleId } = data;
        return prisma_1.prisma.classModule.create({
            data: {
                class: { connect: { id: classId } },
                module: { connect: { id: moduleId } },
                professors: professorIds ? { connect: professorIds.map(id => ({ id })) } : undefined,
            },
            include: { class: true, module: true, professors: true },
        });
    },
    async update(id, data) {
        return prisma_1.prisma.classModule.update({
            where: { id },
            data: {
                professors: data.professorIds ? { set: data.professorIds.map(id => ({ id })) } : undefined,
            },
            include: { class: true, module: true, professors: true },
        });
    },
    async delete(id) {
        return prisma_1.prisma.classModule.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=class-modules.repository.js.map