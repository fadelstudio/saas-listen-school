import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { ProfessorFilters } from './professors.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

export const professorsRepository = {
  async findAll(filters: ProfessorFilters, pagination: PaginationArgs) {
    const where: Prisma.ProfessorWhereInput = {
      ...(filters.campusId && { campusId: filters.campusId }),
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName:  { contains: filters.search, mode: 'insensitive' } },
          { email:     { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.professor.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        include: { _count: { select: { evaluations: true } } },
      }),
      prisma.professor.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    return prisma.professor.findUnique({
      where: { id },
      include: {
        evaluations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { module: true },
        },
      },
    });
  },

  async create(data: { firstName: string; lastName: string; email: string; userId?: string }) {
    return prisma.professor.create({
      data,
    });
  },

  async update(id: string, data: { firstName?: string; lastName?: string; email?: string; userId?: string }) {
    return prisma.professor.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.professor.delete({
      where: { id },
    });
  },
};
