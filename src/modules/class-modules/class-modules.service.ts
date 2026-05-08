import { classModulesRepository } from './class-modules.repository';
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from '../../core/errors/AppError';
import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { auditService } from '../audit/audit.service';

/**
 * Vérifie que les professeurs appartiennent à l'école.
 * Utilise la même logique que professors.repository.ts :
 *   - Via user.schoolId, OU
 *   - Via assignation ClassModule → class → campus → schoolId.
 * N'accepte plus { user: null } comme "appartient à l'école" (trop permissif).
 */
function professorInSchoolWhere(schoolId: string): Prisma.ProfessorWhereInput {
  return {
    OR: [
      { user: { schoolId } },
      { modules: { some: { class: { campus: { schoolId } } } } },
    ],
  };
}

async function assertProfessorsInSchool(professorIds: string[], schoolId: string) {
  const profs = await prisma.professor.findMany({
    where: {
      id: { in: professorIds },
      ...professorInSchoolWhere(schoolId),
    },
    select: { id: true },
  });
  if (profs.length !== professorIds.length) {
    throw new BadRequestError('One or more professors are not in this school');
  }
}

export const classModulesService = {
  async getAll(schoolId: string, filters: { classId?: string; moduleId?: string }) {
    return classModulesRepository.findAll(schoolId, filters);
  },

  async getById(id: string, schoolId: string) {
    const assignment = await classModulesRepository.findById(id, schoolId);
    if (!assignment) throw new NotFoundError('Module Assignment');
    return assignment;
  },

  async create(
    schoolId: string, 
    data: { classId: string; moduleId: string; professorIds?: string[] },
    userRole?: string,
    userCampusIds?: string[],
    userId?: string
  ) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');

    const cls = await prisma.class.findFirst({
      where: { 
        id: data.classId, 
        campus: { schoolId },
        ...(userCampusIds && userCampusIds.length > 0 ? { campusId: { in: userCampusIds } } : {}),
      },
    });
    if (!cls) throw new BadRequestError('Class not found or outside your scope');

    const existing = await classModulesRepository.findByClassAndModule(data.classId, data.moduleId, schoolId);
    if (existing) {
      throw new ConflictError('This module is already assigned to this class');
    }

    const mod = await prisma.module.findFirst({
      where: { id: data.moduleId, schoolId },
    });
    if (!mod) throw new BadRequestError('Module not found in this school');

    if (data.professorIds?.length) {
      await assertProfessorsInSchool(data.professorIds, schoolId);
    }

    const assignment = await classModulesRepository.create(data);

    await auditService.log({
      schoolId,
      userId,
      action: 'CREATE_CLASS_MODULE',
      entity: 'ClassModule',
      entityId: assignment.id,
      details: { classId: data.classId, moduleId: data.moduleId }
    });

    return assignment;
  },

  async update(
    id: string, 
    schoolId: string, 
    data: { professorIds?: string[] },
    userRole?: string,
    userCampusIds?: string[],
    userId?: string
  ) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');

    const assignment = await this.getById(id, schoolId);
    
    // Scoping check for MANAGER/AGENT
    if (userCampusIds && userCampusIds.length > 0) {
      const cls = await prisma.class.findUnique({
        where: { id: assignment.classId },
        select: { campusId: true },
      });
      if (cls && !userCampusIds.includes(cls.campusId)) {
        throw new ForbiddenError('This assignment belongs to a class outside your scope');
      }
    }

    if (data.professorIds?.length) {
      await assertProfessorsInSchool(data.professorIds, schoolId);
    }
    const updated = await classModulesRepository.update(id, schoolId, data);
    if (!updated) throw new NotFoundError('Module Assignment');

    await auditService.log({
      schoolId,
      userId,
      action: 'UPDATE_CLASS_MODULE',
      entity: 'ClassModule',
      entityId: id,
      details: { professorIds: data.professorIds }
    });

    return updated;
  },

  async delete(id: string, schoolId: string, userRole?: string, userCampusIds?: string[], userId?: string) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');

    const assignment = await this.getById(id, schoolId);
    
    // Scoping check
    if (userCampusIds && userCampusIds.length > 0) {
      const cls = await prisma.class.findUnique({
        where: { id: assignment.classId },
        select: { campusId: true },
      });
      if (cls && !userCampusIds.includes(cls.campusId)) {
        throw new ForbiddenError('This assignment belongs to a class outside your scope');
      }
    }

    const ok = await classModulesRepository.delete(id, schoolId);
    if (!ok) throw new NotFoundError('Module Assignment');

    await auditService.log({
      schoolId,
      userId,
      action: 'DELETE_CLASS_MODULE',
      entity: 'ClassModule',
      entityId: id,
    });
  },
};
