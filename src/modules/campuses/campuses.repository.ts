import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { CampusFilters } from './campuses.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

export const campusesRepository = {
  async findAll(filters: CampusFilters, pagination: PaginationArgs) {
    const where: Prisma.CampusWhereInput = {
      ...(filters.search && {
        name: { contains: filters.search, mode: 'insensitive' },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.campus.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        include: { _count: { select: { classes: true, users: true } } },
      }),
      prisma.campus.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    return prisma.campus.findUnique({
      where: { id },
      include: {
        classes: { include: { _count: { select: { users: true } } } },
      },
    });
  },

  async create(data: { name: string; location?: string }) {
    return prisma.campus.create({
      data,
    });
  },

  async update(id: string, data: { name?: string; location?: string }) {
    return prisma.campus.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.campus.delete({
      where: { id },
    });
  },
};
