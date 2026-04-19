import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { AcademicModuleFilters } from './academic-modules.types';
import { parsePagination } from '../../utils/pagination';
import { ConflictError } from '../../core/errors/AppError';

type PaginationArgs = ReturnType<typeof parsePagination>;

const moduleInSchool = (schoolId: string): Prisma.ModuleWhereInput => ({ schoolId });

export const academicModulesRepository = {
  async findAll(schoolId: string, filters: AcademicModuleFilters, pagination: PaginationArgs) {
    const where: Prisma.ModuleWhereInput = {
      AND: [
        moduleInSchool(schoolId),
        ...(filters.search
          ? [
              {
                OR: [
                  {
                    name: {
                      contains: filters.search,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    code: {
                      contains: filters.search,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
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
          _count: { select: { classModules: true, reports: true, evaluations: true } },
        },
      }),
      prisma.module.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string, schoolId: string) {
    return prisma.module.findFirst({
      where: { id, ...moduleInSchool(schoolId) },
      include: {
        classModules: { include: { class: true, professors: true } },
        evaluations: { take: 10, orderBy: { createdAt: 'desc' }, include: { evaluator: true } },
      },
    });
  },

  async create(schoolId: string, data: { name: string; code?: string }) {
    const dup = await prisma.module.findUnique({
      where: { schoolId_name: { schoolId, name: data.name } },
    });
    if (dup) throw new ConflictError('A module with this name already exists in this school.');

    return prisma.module.create({
      data: {
        schoolId,
        name: data.name,
        code: data.code ?? null,
      },
      include: { _count: { select: { classModules: true } } },
    });
  },

  async update(id: string, schoolId: string, data: { name?: string; code?: string }) {
    const row = await prisma.module.findFirst({ where: { id, ...moduleInSchool(schoolId) } });
    if (!row) return null;
    if (data.name && data.name !== row.name) {
      const clash = await prisma.module.findUnique({
        where: { schoolId_name: { schoolId, name: data.name } },
      });
      if (clash) throw new ConflictError('A module with this name already exists in this school.');
    }
    return prisma.module.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code ?? undefined,
      },
    });
  },

  async delete(id: string, schoolId: string): Promise<boolean> {
    const row = await prisma.module.findFirst({ where: { id, ...moduleInSchool(schoolId) } });
    if (!row) return false;
    await prisma.module.delete({ where: { id } });
    return true;
  },
};
