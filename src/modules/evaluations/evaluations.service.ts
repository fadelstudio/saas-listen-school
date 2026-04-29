import { EvaluationStatus } from '@prisma/client';
import { evaluationsRepository } from './evaluations.repository';
import { classModulesRepository } from '../class-modules/class-modules.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { jobQueue } from '../../core/config/queue';
import type { CreateEvaluationInput, UpdateEvaluationInput, EvaluationFilters } from './evaluations.types';
import { prisma } from '../../core/database/prisma';

export const evaluationsService = {
  async create(input: CreateEvaluationInput, userId?: string, schoolId?: string | null) {
    let finalInput = { ...input };

    // 1. User context auto-fill (needed before school / class-module resolution)
    if (userId && !finalInput.classId) {
      const user = await evaluationsRepository.getUserContext(userId);
      if (user) {
        finalInput.classId = user.classId || '';
      }
    }

    let resolvedSchoolId = schoolId ?? null;
    if (!resolvedSchoolId && finalInput.classId) {
      const cls = await prisma.class.findUnique({
        where: { id: finalInput.classId },
        select: { campus: { select: { schoolId: true } } },
      });
      resolvedSchoolId = cls?.campus?.schoolId ?? null;
    }

    if (!resolvedSchoolId) {
      throw new BadRequestError('School context is required');
    }

    // 2. Cross-validation: Triple-Link consistency (tenant-scoped)
    const assignment = await classModulesRepository.findByClassAndModule(
      finalInput.classId,
      finalInput.moduleId,
      resolvedSchoolId,
    );
    if (!assignment) {
      throw new BadRequestError('This module is not assigned to the selected class');
    }

    const isAssigned = assignment.professors.some((p: { id: string }) => p.id === finalInput.professorId);
    if (!isAssigned) {
      throw new BadRequestError('This professor is not assigned to this module for this class');
    }

    // 3. Prevent duplicate evaluation for the same campaign
    if (finalInput.campaignId && userId) {
      const existing = await prisma.evaluation.findFirst({
        where: {
          campaignId: finalInput.campaignId,
          evaluatorId: userId,
        },
      });
      if (existing) {
        throw new BadRequestError('Vous avez déjà participé à cette évaluation.');
      }
    }

    const evaluation = await evaluationsRepository.create(finalInput, userId, resolvedSchoolId);


    return evaluation;
  },

  async getById(id: string, userRole?: string, schoolId?: string | null) {
    const evaluation = await evaluationsRepository.findById(id, schoolId ?? null);
    if (!evaluation) throw new NotFoundError('Evaluation');

    // Scrub evaluator if anonymous and requester is not admin
    if (evaluation.isAnonymous && !['ADMIN', 'SUPERADMIN'].includes(userRole || '')) {
      evaluation.evaluator = null;
      evaluation.evaluatorId = null;
    }

    return evaluation;
  },

  async getAll(query: Record<string, unknown>, userRole?: string, schoolId?: string | null) {
    const pagination = parsePagination(query);
    const filters: EvaluationFilters = {
      status:      query.status as EvaluationStatus | undefined,
      evaluatorId: query.evaluatorId as string | undefined,
      reportId:    query.reportId as string | undefined,
      professorId: query.professorId as string | undefined,
      moduleId:    query.moduleId as string | undefined,
      classId:     query.classId as string | undefined,
      campusId:    query.campusId as string | undefined,
      startDate:   query.startDate as string | undefined,
      endDate:     query.endDate as string | undefined,
    };
    const { items, total } = await evaluationsRepository.findAll(filters, pagination, schoolId ?? null);

    // Filter anonymous evaluators for non-admins
    if (!['ADMIN', 'SUPERADMIN'].includes(userRole || '')) {
      items.forEach((item: any) => {
        if (item.isAnonymous) {
          item.evaluator = null;
          item.evaluatorId = null;
        }
      });
    }

    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async update(
    id: string,
    input: UpdateEvaluationInput,
    userId: string,
    userRole: string,
    schoolId?: string | null
  ) {
    const evaluation = await evaluationsRepository.findById(id, schoolId ?? null);
    if (!evaluation) throw new NotFoundError('Evaluation');

    if (evaluation.evaluatorId !== userId && !['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to update this evaluation');
    }

    return evaluationsRepository.update(id, input, schoolId ?? null);
  },

  async delete(id: string, userRole: string, schoolId?: string | null) {
    if (userRole !== 'ADMIN') throw new ForbiddenError('Only ADMIN can delete evaluations');
    const exists = await evaluationsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Evaluation');
    return evaluationsRepository.delete(id, schoolId ?? null);
  },

  async getStats(query: Record<string, unknown>, schoolId?: string | null) {
    const filters: EvaluationFilters = {
      reportId:    query.reportId as string | undefined,
      professorId: query.professorId as string | undefined,
      moduleId:    query.moduleId as string | undefined,
      classId:     query.classId as string | undefined,
      campusId:    query.campusId as string | undefined,
      startDate:   query.startDate as string | undefined,
      endDate:     query.endDate as string | undefined,
    };
    return evaluationsRepository.getAggregatedStats(filters, schoolId ?? null);
  },

  async triggerAiScoring(id: string, userRole: string, schoolId?: string | null) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can trigger AI scoring');
    }
    const exists = await evaluationsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Evaluation');

    try {
      await jobQueue.add('ai-analysis', {
        type:         'evaluation-scoring',
        evaluationId: id,
      });
    } catch (error) {
      console.warn('⚠️ Could not enqueue AI scoring (Redis down?):', error);
    }

    return { queued: true, evaluationId: id };
  },
};
