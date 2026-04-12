import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { AcademicModuleFilters } from './academic-modules.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

export const academicModulesRepository = {
  async findAll(filters: AcademicModuleFilters, pagination: PaginationArgs) {
    const where: Prisma.ModuleWhereInput = {
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { code: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const allowedSortFields = ['name', 'code', 'createdAt'];
    const sortBy = allowedSortFields.includes(pagination.sortBy) ? pagination.sortBy : 'createdAt';

    const [items, total] = await Promise.all([
      prisma.module.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { [sortBy]: pagination.sortOrder },
        include: { 
          _count: { select: { classModules: true, reports: true, evaluations: true } } 
        },
      }),
      prisma.module.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    return prisma.module.findUnique({
      where: { id },
      include: {
        classModules: { include: { class: true, professors: true } },
        evaluations: { take: 10, orderBy: { createdAt: 'desc' }, include: { evaluator: true } },
      },
    });
  },

  async create(data: { name: string; code?: string }) {
    return prisma.module.create({
      data: {
        name: data.name,
        code: data.code ?? null,
      },
      include: { _count: { select: { classModules: true } } },
    });
  },

  async update(id: string, data: { name?: string; code?: string }) {
    return prisma.module.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code ?? undefined,
      },
    });
  },

  async delete(id: string) {
    return prisma.module.delete({
      where: { id },
    });
  },
};
