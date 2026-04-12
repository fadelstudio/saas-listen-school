import { prisma } from '../../core/database/prisma';
import { AiJobStatus, Prisma } from '@prisma/client';
import { AiJobFilters } from './ai.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

export const aiRepository = {
  async findJobById(id: string) {
    return prisma.aiJob.findUnique({ where: { id } });
  },

  async findJobs(filters: AiJobFilters, pagination: PaginationArgs) {
    const where: Prisma.AiJobWhereInput = {
      ...(filters.status      && { status: filters.status as AiJobStatus }),
      ...(filters.jobType     && { jobType: filters.jobType }),
      ...(filters.reportId    && { reportId: filters.reportId }),
      ...(filters.evaluationId && { evaluationId: filters.evaluationId }),
      ...(filters.decisionId  && { decisionId: filters.decisionId }),
    };

    const [items, total] = await Promise.all([
      prisma.aiJob.findMany({
        where,
        skip:    pagination.skip,
        take:    pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aiJob.count({ where }),
    ]);

    return { items, total };
  },

  async updateJobStatus(
    id: string,
    status: AiJobStatus,
    result?: Prisma.InputJsonObject,
    errorMessage?: string
  ) {
    return prisma.aiJob.update({
      where: { id },
      data:  { status, result, errorMessage },
    });
  },
};
