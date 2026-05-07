import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { CampusFilters } from './campuses.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

export const campusesRepository = {
  async findAll(schoolId: string, filters: CampusFilters, pagination: PaginationArgs) {
    const where: Prisma.CampusWhereInput = {
      schoolId,
      ...(filters.campusIds && filters.campusIds.length > 0 ? { id: { in: filters.campusIds } } : {}),
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

  async findById(id: string, schoolId: string) {
    return prisma.campus.findFirst({
      where: { id, schoolId },
      include: {
        classes: { include: { _count: { select: { users: true } } } },
      },
    });
  },

  async create(data: { name: string; schoolId: string; location?: string }) {
    try {
      return await prisma.campus.create({ data });
    } catch (error) {
      // Legacy single-school DB: campuses table may not have schoolId.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2022'
      ) {
        const { schoolId: _ignored, ...legacyData } = data;
        return (prisma as any).campus.create({ data: legacyData });
      }
      throw error;
    }
  },

  async update(id: string, data: { name?: string; location?: string }, schoolId: string) {
    const existing = await prisma.campus.findFirst({ where: { id, schoolId }, select: { id: true } });
    if (!existing) return null;
    return prisma.campus.update({ where: { id: existing.id }, data });
  },

  async delete(id: string, schoolId: string) {
    const existing = await prisma.campus.findFirst({ where: { id, schoolId }, select: { id: true } });
    if (!existing) return null;
    return prisma.campus.delete({ where: { id: existing.id } });
  },

  async findClasses(id: string, schoolId: string) {
    return prisma.class.findMany({
      where: { campusId: id, campus: { schoolId } },
      include: {
        academicLevel: true,
        _count: { select: { users: true } },
      },
      orderBy: { academicLevel: { order: 'asc' } },
    });
  },

  async findStudents(id: string, schoolId: string) {
    return prisma.user.findMany({
      where: { campuses: { some: { id } }, role: 'STUDENT', schoolId },
      select: {
        id:        true,
        email:     true,
        firstName: true,
        lastName:  true,
        matricule: true,
        isActive:  true,
        classId:   true,
        class:     { select: { name: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  },

  async getStats(id: string, schoolId: string) {
    const [classes, students, professors] = await Promise.all([
      prisma.class.count({
        where: { campusId: id, campus: { schoolId } },
      }),
      prisma.user.count({
        where: { campuses: { some: { id } }, role: 'STUDENT', schoolId },
      }),
      // Fix #3.1 : on filtre les profs via la chaîne complète incluant le schoolId
      prisma.professor.count({
        where: {
          modules: {
            some: { class: { campusId: id, campus: { schoolId } } },
          },
        },
      }),
    ]);
    return { classes, students, professors };
  },

  /**
   * Retourne les professeurs enseignant dans ce campus.
   * Fix #6 : schoolId est maintenant utilisé (était ignoré avec le préfixe _).
   * Double filtre : campus + schoolId pour éviter toute fuite si l'id du campus
   * était réutilisé dans une autre école (cas improbable mais défensif).
   */
  async findProfessors(id: string, schoolId: string) {
    return prisma.professor.findMany({
      where: {
        modules: {
          some: { class: { campusId: id, campus: { schoolId } } },
        },
      },
      include: {
        _count: { select: { evaluations: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  },
};
