"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classModulesService = void 0;
const class_modules_repository_1 = require("./class-modules.repository");
const AppError_1 = require("../../core/errors/AppError");
const prisma_1 = require("../../core/database/prisma");
const audit_service_1 = require("../audit/audit.service");
/**
 * Vérifie que les professeurs appartiennent à l'école.
 * Utilise la même logique que professors.repository.ts :
 *   - Via user.schoolId, OU
 *   - Via assignation ClassModule → class → campus → schoolId.
 * N'accepte plus { user: null } comme "appartient à l'école" (trop permissif).
 */
function professorInSchoolWhere(schoolId) {
    return {
        OR: [
            { user: { schoolId } },
            { modules: { some: { class: { campus: { schoolId } } } } },
        ],
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
    async getAll(schoolId, filters, userRole, userCampusIds) {
        const finalFilters = { ...filters };
        if (['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'].includes(userRole || '') && userCampusIds && userCampusIds.length > 0) {
            finalFilters.campusIds = userCampusIds;
        }
        return class_modules_repository_1.classModulesRepository.findAll(schoolId, finalFilters);
    },
    async getById(id, schoolId, userRole, userCampusIds) {
        const assignment = await class_modules_repository_1.classModulesRepository.findById(id, schoolId);
        if (!assignment)
            throw new AppError_1.NotFoundError('Module Assignment');
        // Scoping check
        if (['MANAGER', 'AGENT', 'VIEWER'].includes(userRole || '') && userCampusIds && userCampusIds.length > 0) {
            if (assignment.class?.campusId && !userCampusIds.includes(assignment.class.campusId)) {
                throw new AppError_1.ForbiddenError('This assignment belongs to a class outside your scope');
            }
        }
        return assignment;
    },
    async create(schoolId, data, userRole, userCampusIds, userId) {
        if (userRole === 'VIEWER')
            throw new AppError_1.ForbiddenError('VIEWER role is read-only');
        const cls = await prisma_1.prisma.class.findFirst({
            where: {
                id: data.classId,
                campus: { schoolId },
                ...(userCampusIds && userCampusIds.length > 0 ? { campusId: { in: userCampusIds } } : {}),
            },
        });
        if (!cls)
            throw new AppError_1.BadRequestError('Class not found or outside your scope');
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
        const assignment = await class_modules_repository_1.classModulesRepository.create(data);
        await audit_service_1.auditService.log({
            schoolId,
            userId,
            action: 'CREATE_CLASS_MODULE',
            entity: 'ClassModule',
            entityId: assignment.id,
            details: { classId: data.classId, moduleId: data.moduleId }
        });
        return assignment;
    },
    async update(id, schoolId, data, userRole, userCampusIds, userId) {
        if (userRole === 'VIEWER')
            throw new AppError_1.ForbiddenError('VIEWER role is read-only');
        const assignment = await this.getById(id, schoolId);
        // Scoping check for MANAGER/AGENT
        if (userCampusIds && userCampusIds.length > 0) {
            const cls = await prisma_1.prisma.class.findUnique({
                where: { id: assignment.classId },
                select: { campusId: true },
            });
            if (cls && !userCampusIds.includes(cls.campusId)) {
                throw new AppError_1.ForbiddenError('This assignment belongs to a class outside your scope');
            }
        }
        if (data.professorIds?.length) {
            await assertProfessorsInSchool(data.professorIds, schoolId);
        }
        const updated = await class_modules_repository_1.classModulesRepository.update(id, schoolId, data);
        if (!updated)
            throw new AppError_1.NotFoundError('Module Assignment');
        await audit_service_1.auditService.log({
            schoolId,
            userId,
            action: 'UPDATE_CLASS_MODULE',
            entity: 'ClassModule',
            entityId: id,
            details: { professorIds: data.professorIds }
        });
        return updated;
    },
    async delete(id, schoolId, userRole, userCampusIds, userId) {
        if (userRole === 'VIEWER')
            throw new AppError_1.ForbiddenError('VIEWER role is read-only');
        const assignment = await this.getById(id, schoolId);
        // Scoping check
        if (userCampusIds && userCampusIds.length > 0) {
            const cls = await prisma_1.prisma.class.findUnique({
                where: { id: assignment.classId },
                select: { campusId: true },
            });
            if (cls && !userCampusIds.includes(cls.campusId)) {
                throw new AppError_1.ForbiddenError('This assignment belongs to a class outside your scope');
            }
        }
        const ok = await class_modules_repository_1.classModulesRepository.delete(id, schoolId);
        if (!ok)
            throw new AppError_1.NotFoundError('Module Assignment');
        await audit_service_1.auditService.log({
            schoolId,
            userId,
            action: 'DELETE_CLASS_MODULE',
            entity: 'ClassModule',
            entityId: id,
        });
    },
};
//# sourceMappingURL=class-modules.service.js.map