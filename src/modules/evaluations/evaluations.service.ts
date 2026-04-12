import { EvaluationStatus } from '@prisma/client';
import { evaluationsRepository } from './evaluations.repository';
import { classModulesRepository } from '../class-modules/class-modules.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { jobQueue } from '../../core/config/queue';
import type { CreateEvaluationInput, UpdateEvaluationInput, EvaluationFilters } from './evaluations.types';

export const evaluationsService = {
  async create(input: CreateEvaluationInput, userId?: string) {
    let finalInput = { ...input };

    // 1. Cross-validation: Triple-Link consistency
    const assignment = await classModulesRepository.findByClassAndModule(finalInput.classId, finalInput.moduleId);
    if (!assignment) {
      throw new BadRequestError('This module is not assigned to the selected class');
    }

    const isAssigned = assignment.professors.some(p => p.id === finalInput.professorId);
    if (!isAssigned) {
      throw new BadRequestError('This professor is not assigned to this module for this class');
    }

    // 2. User context auto-fill
    if (userId && !finalInput.classId) {
      const user = await evaluationsRepository.getUserContext(userId);
      if (user) {
        finalInput.classId = user.classId || '';
      }
    }

    return evaluationsRepository.create(finalInput, userId);
  },

  async getById(id: string) {
    const evaluation = await evaluationsRepository.findById(id);
    if (!evaluation) throw new NotFoundError('Evaluation');
    return evaluation;
  },

  async getAll(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: EvaluationFilters = {
      status:      query.status as EvaluationStatus | undefined,
      evaluatorId: query.evaluatorId as string | undefined,
      reportId:    query.reportId as string | undefined,
      startDate:   query.startDate as string | undefined,
      endDate:     query.endDate as string | undefined,
    };
    const { items, total } = await evaluationsRepository.findAll(filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async update(id: string, input: UpdateEvaluationInput, userId: string, userRole: string) {
    const evaluation = await evaluationsRepository.findById(id);
    if (!evaluation) throw new NotFoundError('Evaluation');

    if (evaluation.evaluatorId !== userId && !['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to update this evaluation');
    }

    return evaluationsRepository.update(id, input);
  },

  async delete(id: string, userRole: string) {
    if (userRole !== 'ADMIN') throw new ForbiddenError('Only ADMIN can delete evaluations');
    const exists = await evaluationsRepository.existsById(id);
    if (!exists) throw new NotFoundError('Evaluation');
    return evaluationsRepository.delete(id);
  },

  async getStats(query: Record<string, unknown>) {
    const filters: EvaluationFilters = {
      reportId:  query.reportId as string | undefined,
      startDate: query.startDate as string | undefined,
      endDate:   query.endDate as string | undefined,
    };
    return evaluationsRepository.getAggregatedStats(filters);
  },

  async triggerAiScoring(id: string, userRole: string) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can trigger AI scoring');
    }
    const exists = await evaluationsRepository.existsById(id);
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
