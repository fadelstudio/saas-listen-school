import { prisma } from '../../core/database/prisma';
import { EvaluationStatus, Prisma } from '@prisma/client';
import { CreateEvaluationInput, UpdateEvaluationInput, EvaluationFilters, EvaluationStats } from './evaluations.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

export const evaluationsRepository = {
  async getUserContext(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { classId: true, campusId: true },
    });
  },

  async create(data: CreateEvaluationInput, evaluatorId?: string) {
    return prisma.evaluation.create({
      data: {
        report:            data.reportId ? { connect: { id: data.reportId } } : undefined,
        evaluator:         evaluatorId ? { connect: { id: evaluatorId } } : undefined,
        professor:         { connect: { id: data.professorId } },
        module:            { connect: { id: data.moduleId } },
        class:             { connect: { id: data.classId } },
        score:             data.score,
        clarityScore:      data.clarityScore,
        pedagogyScore:     data.pedagogyScore,
        availabilityScore: data.availabilityScore,
        rhythmScore:       data.rhythmScore,
        comment:           data.comment,
        isAnonymous:       data.isAnonymous ?? false,
        status:            EvaluationStatus.PENDING,
      } as Prisma.EvaluationCreateInput,
      include: {
        professor: true,
        module:    true,
        class:     true,
        evaluator: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.evaluation.findUnique({
      where: { id },
      include: {
        evaluator: { select: { id: true, firstName: true, lastName: true, email: true } },
        report:    { select: { id: true, title: true, status: true } },
        decision:  true,
        aiJobs:    { orderBy: { createdAt: 'desc' }, take: 3 },
      },
    });
  },

  async findAll(filters: EvaluationFilters, pagination: PaginationArgs) {
    const where: Prisma.EvaluationWhereInput = {
      ...(filters.status      && { status: filters.status }),
      ...(filters.evaluatorId && { evaluatorId: filters.evaluatorId }),
      ...(filters.reportId    && { reportId: filters.reportId }),
      ...(filters.startDate   && { createdAt: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate     && { createdAt: { lte: new Date(filters.endDate) } }),
    };

    const allowedSortFields = ['score', 'createdAt', 'aiScore'];
    const sortBy = allowedSortFields.includes(pagination.sortBy) ? pagination.sortBy : 'createdAt';

    const [items, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip:    pagination.skip,
        take:    pagination.limit,
        orderBy: { [sortBy]: pagination.sortOrder } as Prisma.EvaluationOrderByWithRelationInput,
        include: {
          evaluator: { select: { id: true, firstName: true, lastName: true } },
          report:    { select: { id: true, title: true } },
        },
      }),
      prisma.evaluation.count({ where }),
    ]);

    return { items, total };
  },

  async update(id: string, data: UpdateEvaluationInput) {
    return prisma.evaluation.update({
      where: { id },
      data:  {
        score:             data.score,
        clarityScore:      data.clarityScore,
        pedagogyScore:     data.pedagogyScore,
        availabilityScore: data.availabilityScore,
        rhythmScore:       data.rhythmScore,
        comment:           data.comment,
      },
    });
  },

  async delete(id: string) {
    return prisma.evaluation.delete({ where: { id } });
  },

  async existsById(id: string): Promise<boolean> {
    return (await prisma.evaluation.count({ where: { id } })) > 0;
  },

  async updateAiScore(id: string, aiScore: number) {
    return prisma.evaluation.update({ where: { id }, data: { aiScore } });
  },

  async getAggregatedStats(filters: EvaluationFilters): Promise<EvaluationStats> {
    const where: Prisma.EvaluationWhereInput = {
      ...(filters.reportId  && { reportId: filters.reportId }),
      ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate   && { createdAt: { lte: new Date(filters.endDate) } }),
    };

    const agg = await prisma.evaluation.aggregate({
      where,
      _count: { id: true },
      _avg:   { 
        score: true, 
        aiScore: true,
        clarityScore: true,
        pedagogyScore: true,
        availabilityScore: true,
        rhythmScore: true
      },
    });

    return {
      totalCount:               agg._count.id,
      averageScore:             agg._avg.score,
      averageClarityScore:      agg._avg.clarityScore,
      averagePedagogyScore:     agg._avg.pedagogyScore,
      averageAvailabilityScore: agg._avg.availabilityScore,
      averageRhythmScore:       agg._avg.rhythmScore,
      distribution:             {},
    };
  },
};
