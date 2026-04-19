import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { ClassFilters } from './classes.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

const schoolScope = (schoolId: string): Prisma.ClassWhereInput => ({
  campus: { schoolId },
});

export const classesRepository = {
  async findAll(schoolId: string, filters: ClassFilters, pagination: PaginationArgs) {
    const andParts: Prisma.ClassWhereInput[] = [schoolScope(schoolId)];
    if (filters.campusId) andParts.push({ campusId: filters.campusId });
    if (filters.levelId) {
      const levelBelongsToSchool = Prisma.validator<Prisma.AcademicLevelWhereInput>()({
        schoolId,
      });
      andParts.push({
        levelId: filters.levelId,
        academicLevel: { is: levelBelongsToSchool },
      });
    }
    if (filters.search) {
      andParts.push({
        name: {
          contains: filters.search,
          mode: 'insensitive',
        },
      });
    }
    const where: Prisma.ClassWhereInput = { AND: andParts };

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
          _count: { select: { users: true, reports: true } },
        },
      }),
      prisma.class.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string, schoolId: string) {
    return prisma.class.findFirst({
      where: { id, ...schoolScope(schoolId) },
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

  async update(id: string, schoolId: string, data: { name?: string; campusId?: string; levelId?: string }) {
    const row = await prisma.class.findFirst({ where: { id, ...schoolScope(schoolId) } });
    if (!row) return null;
    return prisma.class.update({
      where: { id },
      data,
      include: { campus: true, academicLevel: true },
    });
  },

  async delete(id: string, schoolId: string): Promise<boolean> {
    const row = await prisma.class.findFirst({ where: { id, ...schoolScope(schoolId) } });
    if (!row) return false;
    await prisma.class.delete({ where: { id } });
    return true;
  },

  async findStudents(classId: string, schoolId: string) {
    return prisma.user.findMany({
      where: {
        classId,
        role: 'STUDENT',
        schoolId,
      },
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
