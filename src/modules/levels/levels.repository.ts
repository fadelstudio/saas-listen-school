import { prisma } from '../../core/database/prisma';

export const levelsRepository = {
  async findAll() {
    return prisma.academicLevel.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { classes: true } } },
    });
  },

  async findById(id: string) {
    return prisma.academicLevel.findUnique({
      where: { id },
      include: { classes: true },
    });
  },

  async create(data: { name: string; order?: number }) {
    return prisma.academicLevel.create({
      data,
    });
  },

  async update(id: string, data: { name?: string; order?: number }) {
    return prisma.academicLevel.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.academicLevel.delete({
      where: { id },
    });
  },
};
