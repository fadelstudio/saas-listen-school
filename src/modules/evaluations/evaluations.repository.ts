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
      select: { classId: true },
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
        deviceMetadata: data.uti ? { uti: data.uti, ...(data.deviceMetadata || {}) } : (data.deviceMetadata as any),
      } as any,
      include: {
        professor: true,
        module: true,
        class: true,
        campaign: { select: { id: true, title: true } },
        evaluator: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  },

  async findById(id: string, schoolId?: string | null) {
    return prisma.evaluation.findFirst({
      where: { id, ...(schoolId ? { schoolId } : {}) },
      include: {
        evaluator: { select: { id: true, firstName: true, lastName: true, email: true } },
        professor: true,
        module: true,
        class: true,
        campaign: { select: { id: true, title: true } },
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
      ...(filters.professorId && { professorId: filters.professorId }),
      ...(filters.moduleId && { moduleId: filters.moduleId }),
      ...(filters.classId && { classId: filters.classId }),
      ...(filters.campusId && { class: { campusId: filters.campusId } }),
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
          professor: { select: { id: true, firstName: true, lastName: true, matricule: true } },
          module: { select: { id: true, name: true, code: true } },
          class: { select: { id: true, name: true } },
          campaign: { select: { id: true, title: true } },
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
      ...(filters.professorId && { professorId: filters.professorId }),
      ...(filters.moduleId && { moduleId: filters.moduleId }),
      ...(filters.classId && { classId: filters.classId }),
      ...(filters.campusId && { class: { campusId: filters.campusId } }),
      ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } }),
    };

    const [agg, profStats] = await Promise.all([
      prisma.evaluation.aggregate({
        where,
        _count: { id: true },
        _avg: {
          score: true,
          aiScore: true,
        },
      }),
      prisma.evaluation.groupBy({
        by: ['professorId'],
        where,
        _avg: { score: true },
        _count: { id: true },
        orderBy: { _avg: { score: 'desc' } },
        take: 10, // Fetch top 10 to slice top 5 and bottom 5 if needed
      }),
    ]);

    // Fetch professor names for rankings
    const profIds = profStats.map(s => s.professorId);
    const professors = await prisma.professor.findMany({
      where: { id: { in: profIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const profMap = new Map(professors.map(p => [p.id, `${p.firstName} ${p.lastName}`]));

    const allRankings = profStats.map(s => ({
      name: profMap.get(s.professorId) || 'Inconnu',
      role: 'Professeur',
      score: Number((s._avg.score || 0).toFixed(1)),
      count: s._count.id,
    }));

    // Calculate criteria averages (mapping Enums to scores)
    const criteriaScores = await prisma.evaluation.findMany({
      where,
      select: {
        comprehensionRating: true,
        explanationRating: true,
        pedagogyRating: true,
        availabilityRating: true,
        rhythmRating: true,
        aiScore: true,
      },
    });

    const ratingToScore: Record<string, number> = {
      VERY_POOR: 4,
      POOR: 8,
      FAIR: 12,
      GOOD: 16,
      EXCELLENT: 20,
    };

    const sum = (key: keyof typeof criteriaScores[0]) => 
      criteriaScores.reduce((acc, curr) => acc + (ratingToScore[curr[key] as string] || 0), 0);
    
    const count = criteriaScores.length || 1;

    // Calculate sentiment distribution based on AI scores
    const aiScores = criteriaScores
      .map(e => (e as any).aiScore)
      .filter((s): s is number => typeof s === 'number');
    
    const totalAi = aiScores.length || 1;
    const positive = aiScores.filter(s => s >= 15).length;
    const neutral = aiScores.filter(s => s >= 10 && s < 15).length;
    const negative = aiScores.filter(s => s < 10).length;

    return {
      totalCount: agg._count.id,
      averageScore: agg._avg.score,
      averageAiScore: agg._avg.aiScore,
      avgComprehension: Number((sum('comprehensionRating') / count).toFixed(1)),
      avgExplanation: Number((sum('explanationRating') / count).toFixed(1)),
      avgPedagogy: Number((sum('pedagogyRating') / count).toFixed(1)),
      avgAvailability: Number((sum('availabilityRating') / count).toFixed(1)),
      avgRhythm: Number((sum('rhythmRating') / count).toFixed(1)),
      sentimentDistribution: {
        positive: Math.round((positive / totalAi) * 100),
        neutral: Math.round((neutral / totalAi) * 100),
        negative: Math.round((negative / totalAi) * 100),
      },
      rankings: {
        top: allRankings.slice(0, 5),
        bottom: [...allRankings].reverse().slice(0, 5),
      },
    };
  },
};
