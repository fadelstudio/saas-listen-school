import { prisma } from '../../core/database/prisma';

export const levelsRepository = {
  async findAll(pagination: { skip: number, limit: number }) {
    const [items, total] = await Promise.all([
      prisma.academicLevel.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { order: 'asc' },
        include: { _count: { select: { classes: true } } },
      }),
      prisma.academicLevel.count(),
    ]);
    return { items, total };
  },

  async findById(id: string) {
    return prisma.academicLevel.findUnique({
      where: { id },
      include: { classes: true },
    });
  },

  async create(data: { name: string; order?: number }) {
    const existing = await prisma.academicLevel.findUnique({
      where: { name: data.name },
    });
    if (existing) return existing;
    
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
