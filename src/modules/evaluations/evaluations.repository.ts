import { prisma } from '../../core/database/prisma';
import { EvaluationStatus, Prisma, RatingBand } from '@prisma/client';
import { CreateEvaluationInput, UpdateEvaluationInput, EvaluationFilters, EvaluationStats } from './evaluations.types';
import { parsePagination } from '../../utils/pagination';
import { computeScoreFromRatings, hasAllRatings } from './evaluations.scoring';
import { BadRequestError, NotFoundError } from '../../core/errors/AppError';

type PaginationArgs = ReturnType<typeof parsePagination>;

function mergeRatings(
  existing: {
    comprehensionRating: RatingBand | null;
    explanationRating: RatingBand | null;
    pedagogyRating: RatingBand | null;
    availabilityRating: RatingBand | null;
    rhythmRating: RatingBand | null;
  },
  patch: UpdateEvaluationInput
) {
  return {
    comprehensionRating: patch.comprehensionRating ?? existing.comprehensionRating,
    explanationRating: patch.explanationRating ?? existing.explanationRating,
    pedagogyRating: patch.pedagogyRating ?? existing.pedagogyRating,
    availabilityRating: patch.availabilityRating ?? existing.availabilityRating,
    rhythmRating: patch.rhythmRating ?? existing.rhythmRating,
  };
}

export const evaluationsRepository = {
  async getUserContext(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { classId: true, campusId: true },
    });
  },

  async create(data: CreateEvaluationInput, evaluatorId?: string, schoolId?: string | null) {
    if (
      !data.comprehensionRating ||
      !data.explanationRating ||
      !data.pedagogyRating ||
      !data.availabilityRating ||
      !data.rhythmRating
    ) {
      throw new BadRequestError('All five rating fields (comprehension, explanation, pedagogy, availability, rhythm) are required');
    }
    const ratings = {
      comprehensionRating: data.comprehensionRating,
      explanationRating: data.explanationRating,
      pedagogyRating: data.pedagogyRating,
      availabilityRating: data.availabilityRating,
      rhythmRating: data.rhythmRating,
    };
    const score = computeScoreFromRatings(ratings);

    return prisma.evaluation.create({
      data: {
        report: data.reportId ? { connect: { id: data.reportId } } : undefined,
        evaluator: evaluatorId ? { connect: { id: evaluatorId } } : undefined,
        professor: { connect: { id: data.professorId } },
        module: { connect: { id: data.moduleId } },
        class: { connect: { id: data.classId } },
        school: schoolId ? { connect: { id: schoolId } } : undefined,
        score,
        comprehensionRating: data.comprehensionRating,
        explanationRating: data.explanationRating,
        pedagogyRating: data.pedagogyRating,
        availabilityRating: data.availabilityRating,
        rhythmRating: data.rhythmRating,
        comment: data.comment,
        isAnonymous: data.isAnonymous ?? false,
        status: EvaluationStatus.PENDING,
      },
      include: {
        professor: true,
        module: true,
        class: true,
        evaluator: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  },

  async findById(id: string, schoolId?: string | null) {
    return prisma.evaluation.findFirst({
      where: { id, ...(schoolId ? { schoolId } : {}) },
      include: {
        evaluator: { select: { id: true, firstName: true, lastName: true, email: true } },
        report: { select: { id: true, title: true, status: true } },
        decision: true,
        aiJobs: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
    });
  },

  async findAll(filters: EvaluationFilters, pagination: PaginationArgs, schoolId?: string | null) {
    const where: Prisma.EvaluationWhereInput = {
      ...(schoolId ? { schoolId } : {}),
      ...(filters.status && { status: filters.status }),
      ...(filters.evaluatorId && { evaluatorId: filters.evaluatorId }),
      ...(filters.reportId && { reportId: filters.reportId }),
      ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } }),
    };

    const allowedSortFields = ['score', 'createdAt', 'aiScore'];
    const sortBy = allowedSortFields.includes(pagination.sortBy) ? pagination.sortBy : 'createdAt';

    const [items, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { [sortBy]: pagination.sortOrder } as Prisma.EvaluationOrderByWithRelationInput,
        include: {
          evaluator: { select: { id: true, firstName: true, lastName: true } },
          report: { select: { id: true, title: true } },
        },
      }),
      prisma.evaluation.count({ where }),
    ]);

    return { items, total };
  },

  async update(id: string, data: UpdateEvaluationInput, schoolId?: string | null) {
    const existing = await prisma.evaluation.findFirst({ where: { id, ...(schoolId ? { schoolId } : {}) } });
    if (!existing) {
      throw new NotFoundError('Evaluation');
    }

    const merged = mergeRatings(existing, data);
    let score: number | undefined;
    if (hasAllRatings(merged)) {
      score = computeScoreFromRatings(merged);
    }

    return prisma.evaluation.update({
      where: { id: existing.id },
      data: {
        comprehensionRating: data.comprehensionRating,
        explanationRating: data.explanationRating,
        pedagogyRating: data.pedagogyRating,
        availabilityRating: data.availabilityRating,
        rhythmRating: data.rhythmRating,
        comment: data.comment,
        ...(score !== undefined ? { score } : {}),
      },
    });
  },

  async delete(id: string, schoolId?: string | null) {
    return prisma.evaluation.deleteMany({ where: { id, ...(schoolId ? { schoolId } : {}) } });
  },

  async existsById(id: string, schoolId?: string | null): Promise<boolean> {
    return (await prisma.evaluation.count({ where: { id, ...(schoolId ? { schoolId } : {}) } })) > 0;
  },

  async updateAiScore(id: string, aiScore: number) {
    return prisma.evaluation.update({ where: { id }, data: { aiScore } });
  },

  async getAggregatedStats(filters: EvaluationFilters, schoolId?: string | null): Promise<EvaluationStats> {
    const where: Prisma.EvaluationWhereInput = {
      ...(schoolId ? { schoolId } : {}),
      ...(filters.reportId && { reportId: filters.reportId }),
      ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } }),
    };

    const agg = await prisma.evaluation.aggregate({
      where,
      _count: { id: true },
      _avg: {
        score: true,
        aiScore: true,
      },
    });

    return {
      totalCount: agg._count.id,
      averageScore: agg._avg.score,
      averageAiScore: agg._avg.aiScore,
    };
  },
};
