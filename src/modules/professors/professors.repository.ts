import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { ProfessorFilters } from './professors.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

/**
 * Filtre les professeurs appartenant à une école donnée.
 * Un professeur appartient à l'école si son schoolId correspond.
 */
export function professorInSchool(schoolId: string): Prisma.ProfessorWhereInput {
  return { schoolId };
}

export const professorsRepository = {
  async findAll(schoolId: string, filters: ProfessorFilters, pagination: PaginationArgs) {
    const andParts: Prisma.ProfessorWhereInput[] = [professorInSchool(schoolId)];

    if (filters.search) {
      andParts.push({
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' as const } },
          { lastName: { contains: filters.search, mode: 'insensitive' as const } },
          { email: { contains: filters.search, mode: 'insensitive' as const } },
          { matricule: { contains: filters.search, mode: 'insensitive' as const } },
          { numero: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      });
    }

    if (filters.classId) {
      andParts.push({
        modules: {
          some: {
            classId: filters.classId,
          },
        },
      });
    }

    if (filters.campusId) {
      andParts.push({
        modules: {
          some: {
            class: { campusId: filters.campusId },
          },
        },
      });
    }

    if (filters.campusIds && filters.campusIds.length > 0) {
      andParts.push({
        modules: {
          some: {
            class: { campusId: { in: filters.campusIds } },
          },
        },
      });
    }

    const where: Prisma.ProfessorWhereInput = { AND: andParts };


    const [items, total] = await Promise.all([
      prisma.professor.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        include: {
          user: { select: { id: true, avatarPath: true } },
          _count: { select: { evaluations: true } },
          modules: { select: { moduleId: true } },
        },
      }),
      prisma.professor.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string, schoolId: string) {
    return prisma.professor.findFirst({
      where: { id, ...professorInSchool(schoolId) },
      include: {
        user: { select: { id: true, avatarPath: true } },
        evaluations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { module: true, class: { select: { campusId: true } } },
        },
      },
    });
  },

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    userId?: string;
    schoolId: string;
    matricule?: string | null;
    numero?: string | null;
    phone?: string | null;
  }) {
    return prisma.professor.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        userId: data.userId,
        schoolId: data.schoolId,
        matricule: data.matricule ?? null,
        numero: data.numero ?? null,
        phone: data.phone ?? null,
      },
      include: {
        user: { select: { id: true, avatarPath: true } },
        _count: { select: { evaluations: true } },
      },
    });
  },

  async update(
    id: string,
    schoolId: string,
    data: {
      email?: string;
      userId?: string;
      matricule?: string | null;
      numero?: string | null;
      phone?: string | null;
    },
  ) {
    const row = await prisma.professor.findFirst({ where: { id, ...professorInSchool(schoolId) } });
    if (!row) return null;
    return prisma.professor.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, avatarPath: true } },
        _count: { select: { evaluations: true } },
      },
    });
  },

  async delete(id: string, schoolId: string): Promise<boolean> {
    const row = await prisma.professor.findFirst({ where: { id, ...professorInSchool(schoolId) } });
    if (!row) return false;
    await prisma.professor.delete({ where: { id } });
    return true;
  },
};
