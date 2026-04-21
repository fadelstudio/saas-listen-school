import { prisma } from '../../core/database/prisma';
import { ReportStatus, Prisma } from '@prisma/client';
import { CreateReportInput, UpdateReportInput, ReportFilters } from './reports.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

export const reportsRepository = {
  async getUserContext(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { classId: true, campuses: { select: { id: true }, take: 1 } },
    });
  },

  async create(data: CreateReportInput, authorId?: string, schoolId?: string | null) {
    return prisma.report.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type ?? 'OTHER',
        priority: data.priority ?? 'MEDIUM',
        category: data.category,
        isAnonymous: data.isAnonymous ?? false,
        author: authorId ? { connect: { id: authorId } } : undefined,
        class: data.classId ? { connect: { id: data.classId } } : undefined,
        professor: data.professorId ? { connect: { id: data.professorId } } : undefined,
        module: data.moduleId ? { connect: { id: data.moduleId } } : undefined,
        school: schoolId ? { connect: { id: schoolId } } : undefined,
        status: ReportStatus.SUBMITTED,
      } satisfies Prisma.ReportCreateInput,
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
        class: true,
        professor: true,
        module: true,
      },
    });
  },

  async findById(id: string, schoolId?: string | null) {
    return prisma.report.findFirst({
      where: {
        id,
        ...(schoolId ? { schoolId } : {}),
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
        class: true,
        professor: true,
        module: true,
        aiJobs: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  },

  async findAll(filters: ReportFilters, pagination: PaginationArgs, schoolId?: string | null) {
    const where: Prisma.ReportWhereInput = {
      ...(schoolId ? { schoolId } : {}),
      ...(filters.status && { status: filters.status }),
      ...(filters.authorId && { authorId: filters.authorId }),
      ...(filters.campusId && { class: { campusId: filters.campusId } }),
      ...(filters.classId && { classId: filters.classId }),
      ...(filters.professorId && { professorId: filters.professorId }),
      ...(filters.moduleId && { moduleId: filters.moduleId }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.isAnonymous !== undefined && { isAnonymous: filters.isAnonymous }),
      ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const allowedSortFields = ['title', 'createdAt', 'priority', 'status'];
    const sortBy = allowedSortFields.includes(pagination.sortBy) ? pagination.sortBy : 'createdAt';

    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { [sortBy]: pagination.sortOrder } as Prisma.ReportOrderByWithRelationInput,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true } },
          class: true,
          professor: true,
          module: true,
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { items, total };
  },

  async update(id: string, data: UpdateReportInput, schoolId?: string | null) {
    const report = await prisma.report.findFirst({
      where: { id, ...(schoolId ? { schoolId } : {}) },
      select: { id: true },
    });
    if (!report) return null;
    return prisma.report.update({
      where: { id: report.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
      },
    });
  },

  async updateStatus(id: string, status: ReportStatus, schoolId?: string | null) {
    const report = await prisma.report.findFirst({
      where: { id, ...(schoolId ? { schoolId } : {}) },
      select: { id: true },
    });
    if (!report) return null;
    return prisma.report.update({ where: { id: report.id }, data: { status } });
  },

  async updateAiAnalysis(id: string, aiAnalysis: string) {
    return prisma.report.update({ where: { id }, data: { aiAnalysis } });
  },

  async delete(id: string, schoolId?: string | null) {
    return prisma.report.deleteMany({
      where: { id, ...(schoolId ? { schoolId } : {}) },
    });
  },

  async existsById(id: string, schoolId?: string | null): Promise<boolean> {
    const count = await prisma.report.count({
      where: {
        id,
        ...(schoolId ? { schoolId } : {}),
      },
    });
    return count > 0;
  },
};
