import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { ClassFilters } from './classes.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

export const classesRepository = {
  async findAll(filters: ClassFilters, pagination: PaginationArgs) {
    const where: Prisma.ClassWhereInput = {
      ...(filters.campusId && { campusId: filters.campusId }),
      ...(filters.levelId && { levelId: filters.levelId }),
      ...(filters.search && {
        name: { contains: filters.search, mode: 'insensitive' },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        include: { 
          campus: true, 
          academicLevel: true,
          classModules: { include: { module: true } },
          _count: { select: { users: true, reports: true } } 
        },
      }),
      prisma.class.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    return prisma.class.findUnique({
      where: { id },
      include: {
        campus: true,
        academicLevel: true,
        classModules: { include: { module: true, professors: true } },
        users: { select: { id: true, firstName: true, lastName: true, email: true } },
        reports: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
  },

  async create(data: { name: string; campusId: string; levelId: string }) {
    return prisma.class.create({
      data,
      include: { campus: true, academicLevel: true },
    });
  },

  async update(id: string, data: { name?: string; campusId?: string; levelId?: string }) {
    return prisma.class.update({
      where: { id },
      data,
      include: { campus: true, academicLevel: true },
    });
  },

  async delete(id: string) {
    return prisma.class.delete({
      where: { id },
    });
  },

  async findStudents(id: string) {
    return prisma.user.findMany({
      where: { classId: id, role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        matricule: true,
        isActive: true,
        campusId: true,
      },
      orderBy: { lastName: 'asc' },
    });
  },
};
