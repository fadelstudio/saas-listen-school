import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';

export const classModulesRepository = {
  async findAll(filters: { classId?: string; moduleId?: string }) {
    return prisma.classModule.findMany({
      where: {
        ...(filters.classId && { classId: filters.classId }),
        ...(filters.moduleId && { moduleId: filters.moduleId }),
      },
      include: {
        class: true,
        module: true,
        professors: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { class: { name: 'asc' } } as Prisma.ClassModuleOrderByWithRelationInput,
    });
  },

  async findById(id: string) {
    return prisma.classModule.findUnique({
      where: { id },
      include: {
        class: true,
        module: true,
        professors: true,
      },
    });
  },

  async findByClassAndModule(classId: string, moduleId: string) {
    return prisma.classModule.findUnique({
      where: { classId_moduleId: { classId, moduleId } },
      include: { professors: true },
    });
  },

  async create(data: { classId: string; moduleId: string; professorIds?: string[] }) {
    const { professorIds, classId, moduleId } = data;
    return prisma.classModule.create({
      data: {
        class:  { connect: { id: classId } },
        module: { connect: { id: moduleId } },
        professors: professorIds ? { connect: professorIds.map(id => ({ id })) } : undefined,
      } as Prisma.ClassModuleCreateInput,
      include: { class: true, module: true, professors: true },
    });
  },

  async update(id: string, data: { professorIds?: string[] }) {
    return prisma.classModule.update({
      where: { id },
      data: {
        professors: data.professorIds ? { set: data.professorIds.map(id => ({ id })) } : undefined,
      },
      include: { class: true, module: true, professors: true },
    });
  },

  async delete(id: string) {
    return prisma.classModule.delete({
      where: { id },
    });
  },
};
