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

  async findClasses(id: string) {
    return prisma.class.findMany({
      where: { campusId: id },
      include: {
        academicLevel: true,
        _count: { select: { users: true } },
      },
      orderBy: { academicLevel: { order: 'asc' } },
    });
  },

  async findStudents(id: string) {
    return prisma.user.findMany({
      where: { campusId: id, role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        matricule: true,
        isActive: true,
        classId: true,
        class: { select: { name: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  },

  async getStats(id: string) {
    const [classes, students, professors] = await Promise.all([
      prisma.class.count({ where: { campusId: id } }),
      prisma.user.count({ where: { campusId: id, role: 'STUDENT' } }),
      prisma.professor.count({ where: { campusId: id } }),
    ]);
    return { classes, students, professors };
  },

  async findProfessors(id: string) {
    return prisma.professor.findMany({
      where: { campusId: id },
      include: {
        _count: { select: { evaluations: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  },
};
