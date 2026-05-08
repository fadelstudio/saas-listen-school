import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';

const classModuleInSchool = (schoolId: string): Prisma.ClassModuleWhereInput => ({
  class: { campus: { schoolId } },
});

export const classModulesRepository = {
  async findAll(schoolId: string, filters: { classId?: string; moduleId?: string; campusIds?: string[] }) {
    return prisma.classModule.findMany({
      where: {
        AND: [
          classModuleInSchool(schoolId),
          ...(filters.classId ? [{ classId: filters.classId }] : []),
          ...(filters.moduleId ? [{ moduleId: filters.moduleId }] : []),
          ...(filters.campusIds && filters.campusIds.length > 0 ? [{ class: { campusId: { in: filters.campusIds } } }] : []),
        ],
      },
      include: {
        class: true,
        module: true,
        professors: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { class: { name: 'asc' } } as Prisma.ClassModuleOrderByWithRelationInput,
    });
  },

  async findById(id: string, schoolId: string) {
    return prisma.classModule.findFirst({
      where: { id, ...classModuleInSchool(schoolId) },
      include: {
        class: true,
        module: true,
        professors: true,
      },
    });
  },

  async findByClassAndModule(classId: string, moduleId: string, schoolId: string) {
    return prisma.classModule.findFirst({
      where: {
        AND: [
          { classId, moduleId },
          classModuleInSchool(schoolId),
        ],
      },
      include: { professors: true },
    });
  },

  async create(data: { classId: string; moduleId: string; professorIds?: string[] }) {
    const { professorIds, classId, moduleId } = data;
    return prisma.classModule.create({
      data: {
        class: { connect: { id: classId } },
        module: { connect: { id: moduleId } },
        professors: professorIds ? { connect: professorIds.map((pid) => ({ id: pid })) } : undefined,
      } as Prisma.ClassModuleCreateInput,
      include: { class: true, module: true, professors: true },
    });
  },

  async update(id: string, schoolId: string, data: { professorIds?: string[] }) {
    const row = await prisma.classModule.findFirst({ where: { id, ...classModuleInSchool(schoolId) } });
    if (!row) return null;
    return prisma.classModule.update({
      where: { id },
      data: {
        professors: data.professorIds ? { set: data.professorIds.map((pid) => ({ id: pid })) } : undefined,
      },
      include: { class: true, module: true, professors: true },
    });
  },

  async delete(id: string, schoolId: string): Promise<boolean> {
    const row = await prisma.classModule.findFirst({ where: { id, ...classModuleInSchool(schoolId) } });
    if (!row) return false;
    await prisma.classModule.delete({ where: { id } });
    return true;
  },
};
