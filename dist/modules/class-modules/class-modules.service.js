"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classModulesService = void 0;
const class_modules_repository_1 = require("./class-modules.repository");
const AppError_1 = require("../../core/errors/AppError");
const prisma_1 = require("../../core/database/prisma");
/** Prof rattaché à l’école : sans campus (= tous) ou campus de l’école. */
function professorInSchoolWhere(schoolId) {
    return {
        OR: [{ campusId: null }, { campus: { schoolId } }],
    };
}
async function assertProfessorsInSchool(professorIds, schoolId) {
    const profs = await prisma_1.prisma.professor.findMany({
        where: {
            id: { in: professorIds },
            ...professorInSchoolWhere(schoolId),
        },
        select: { id: true },
    });
    if (profs.length !== professorIds.length) {
        throw new AppError_1.BadRequestError('One or more professors are not in this school');
    }
}
exports.classModulesService = {
    async getAll(schoolId, filters) {
        return class_modules_repository_1.classModulesRepository.findAll(schoolId, filters);
    },
    async getById(id, schoolId) {
        const assignment = await class_modules_repository_1.classModulesRepository.findById(id, schoolId);
        if (!assignment)
            throw new AppError_1.NotFoundError('Module Assignment');
        return assignment;
    },
    async create(schoolId, data) {
        const cls = await prisma_1.prisma.class.findFirst({
            where: { id: data.classId, campus: { schoolId } },
        });
        if (!cls)
            throw new AppError_1.BadRequestError('Class not found in this school');
        const existing = await class_modules_repository_1.classModulesRepository.findByClassAndModule(data.classId, data.moduleId, schoolId);
        if (existing) {
            throw new AppError_1.ConflictError('This module is already assigned to this class');
        }
        const mod = await prisma_1.prisma.module.findFirst({
            where: { id: data.moduleId, schoolId },
        });
        if (!mod)
            throw new AppError_1.BadRequestError('Module not found in this school');
        if (data.professorIds?.length) {
            await assertProfessorsInSchool(data.professorIds, schoolId);
        }
        return class_modules_repository_1.classModulesRepository.create(data);
    },
    async update(id, schoolId, data) {
        await this.getById(id, schoolId);
        if (data.professorIds?.length) {
            await assertProfessorsInSchool(data.professorIds, schoolId);
        }
        const updated = await class_modules_repository_1.classModulesRepository.update(id, schoolId, data);
        if (!updated)
            throw new AppError_1.NotFoundError('Module Assignment');
        return updated;
    },
    async delete(id, schoolId) {
        const ok = await class_modules_repository_1.classModulesRepository.delete(id, schoolId);
        if (!ok)
            throw new AppError_1.NotFoundError('Module Assignment');
    },
};
//# sourceMappingURL=class-modules.service.js.map