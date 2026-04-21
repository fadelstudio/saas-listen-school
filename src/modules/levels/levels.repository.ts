import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { ConflictError } from '../../core/errors/AppError';

const levelInSchool = (schoolId: string): Prisma.AcademicLevelWhereInput => ({
  schoolId,
});

export const levelsRepository = {
  async findAll(schoolId: string, pagination: { skip: number; limit: number }) {
    const where = levelInSchool(schoolId);
    const [items, total] = await Promise.all([
      prisma.academicLevel.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { order: 'asc' },
        include: { _count: { select: { classes: true } } },
      }),
      prisma.academicLevel.count({ where }),
    ]);
    return { items, total };
  },

  async findById(id: string, schoolId: string) {
    return prisma.academicLevel.findFirst({
      where: { id, ...levelInSchool(schoolId) },
      include: { classes: { where: { campus: { schoolId } } } },
    });
  },

  async create(schoolId: string, data: { name: string; order?: number }) {
    const existing = await prisma.academicLevel.findUnique({
      where: { schoolId_name: { schoolId, name: data.name } },
    });
    if (existing) throw new ConflictError('A level with this name already exists in this school.');

    return prisma.academicLevel.create({
      data: {
        schoolId,
        name: data.name,
        order: data.order ?? 0,
      },
    });
  },

  async update(id: string, schoolId: string, data: { name?: string; order?: number }) {
    const row = await prisma.academicLevel.findFirst({ where: { id, ...levelInSchool(schoolId) } });
    if (!row) return null;
    if (data.name && data.name !== row.name) {
      const clash = await prisma.academicLevel.findUnique({
        where: { schoolId_name: { schoolId, name: data.name } },
      });
      if (clash) throw new ConflictError('A level with this name already exists in this school.');
    }
    return prisma.academicLevel.update({
      where: { id },
      data,
    });
  },

  async delete(id: string, schoolId: string): Promise<boolean> {
    const row = await prisma.academicLevel.findFirst({ where: { id, ...levelInSchool(schoolId) } });
    if (!row) return false;
    await prisma.academicLevel.delete({ where: { id } });
    return true;
  },
};
