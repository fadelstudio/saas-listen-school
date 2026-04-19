import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { ProfessorFilters } from './professors.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

/** Prof rattaché à l’école : campus dans l’école OU aucun campus (= tous les campus). */
export function professorInSchool(schoolId: string): Prisma.ProfessorWhereInput {
  return {
    OR: [{ campusId: null }, { campus: { schoolId } }],
  };
}

export const professorsRepository = {
  async findAll(schoolId: string, filters: ProfessorFilters, pagination: PaginationArgs) {
    const andParts: Prisma.ProfessorWhereInput[] = [professorInSchool(schoolId)];

    if (filters.campusId) {
      andParts.push({
        OR: [{ campusId: null }, { campusId: filters.campusId }],
      });
    }

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

    const where: Prisma.ProfessorWhereInput = { AND: andParts };

    const [items, total] = await Promise.all([
      prisma.professor.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        include: {
          campus: { select: { id: true, name: true, code: true } },
          user: { select: { id: true, avatarPath: true } },
          _count: { select: { evaluations: true } },
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
        campus: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, avatarPath: true } },
        evaluations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { module: true },
        },
      },
    });
  },

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    userId?: string;
    campusId: string | null;
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
        campusId: data.campusId,
        matricule: data.matricule ?? null,
        numero: data.numero ?? null,
        phone: data.phone ?? null,
      },
      include: {
        campus: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, avatarPath: true } },
        _count: { select: { evaluations: true } },
      },
    });
  },

  async update(
    id: string,
    schoolId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      userId?: string;
      campusId?: string | null;
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
        campus: { select: { id: true, name: true, code: true } },
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
