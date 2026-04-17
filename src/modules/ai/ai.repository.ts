import { prisma } from '../../core/database/prisma';
import { AiJobStatus, Prisma } from '@prisma/client';
import { AiJobFilters } from './ai.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

export const aiRepository = {
  async createJob(data: {
    jobType: string;
    status: AiJobStatus;
    payload: Prisma.InputJsonObject;
    reportId?: string | null;
    evaluationId?: string | null;
    decisionId?: string | null;
    errorMessage?: string | null;
  }) {
    return prisma.aiJob.create({
      data: {
        jobType: data.jobType,
        status: data.status,
        payload: data.payload,
        reportId: data.reportId ?? null,
        evaluationId: data.evaluationId ?? null,
        decisionId: data.decisionId ?? null,
        errorMessage: data.errorMessage ?? null,
      },
    });
  },

  async findJobById(id: string, schoolId?: string | null) {
    return prisma.aiJob.findFirst({
      where: {
        id,
        ...(schoolId
          ? {
              OR: [
                { report: { schoolId } },
                { evaluation: { schoolId } },
                { decision: { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } },
              ],
            }
          : {}),
      },
    });
  },

  async findJobs(filters: AiJobFilters, pagination: PaginationArgs, schoolId?: string | null) {
    const where: Prisma.AiJobWhereInput = {
      ...(schoolId
        ? {
            OR: [
              { report: { schoolId } },
              { evaluation: { schoolId } },
              { decision: { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } },
            ],
          }
        : {}),
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
