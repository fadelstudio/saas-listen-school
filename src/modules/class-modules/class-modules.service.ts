import { classModulesRepository } from './class-modules.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../../core/errors/AppError';
import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';

/** Prof rattaché à l’école : sans campus (= tous) ou campus de l’école. */
function professorInSchoolWhere(schoolId: string): Prisma.ProfessorWhereInput {
  return {
    OR: [{ campusId: null }, { campus: { schoolId } }],
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

  async create(schoolId: string, data: { classId: string; moduleId: string; professorIds?: string[] }) {
    const cls = await prisma.class.findFirst({
      where: { id: data.classId, campus: { schoolId } },
    });
    if (!cls) throw new BadRequestError('Class not found in this school');

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

    return classModulesRepository.create(data);
  },

  async update(id: string, schoolId: string, data: { professorIds?: string[] }) {
    await this.getById(id, schoolId);
    if (data.professorIds?.length) {
      await assertProfessorsInSchool(data.professorIds, schoolId);
    }
    const updated = await classModulesRepository.update(id, schoolId, data);
    if (!updated) throw new NotFoundError('Module Assignment');
    return updated;
  },

  async delete(id: string, schoolId: string) {
    const ok = await classModulesRepository.delete(id, schoolId);
    if (!ok) throw new NotFoundError('Module Assignment');
  },
};
