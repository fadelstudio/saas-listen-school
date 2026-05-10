import { EvaluationStatus } from '@prisma/client';
import { evaluationsRepository } from './evaluations.repository';
import { classModulesRepository } from '../class-modules/class-modules.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { jobQueue } from '../../core/config/queue';
import type { CreateEvaluationInput, UpdateEvaluationInput, EvaluationFilters } from './evaluations.types';
import { prisma } from '../../core/database/prisma';
import { auditService } from '../audit/audit.service';

export const evaluationsService = {
  resolveScopedCampusFilter(
    userRole?: string,
    userCampusIds?: string[],
    requestedCampusId?: string
  ): string[] | undefined {
    if (!userRole || !['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'].includes(userRole)) return undefined;
    if (!userCampusIds || userCampusIds.length === 0) return undefined;
    if (requestedCampusId) {
      if (!userCampusIds.includes(requestedCampusId)) {
        throw new ForbiddenError('Requested campus is outside your scope');
      }
      return [requestedCampusId];
    }
    return userCampusIds;
  },

  async create(input: CreateEvaluationInput, userId?: string, schoolId?: string | null, userRole?: string) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
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
    if (finalInput.campaignId) {
      const campaign = await prisma.evaluationCampaign.findUnique({
        where: { id: finalInput.campaignId }
      });
      if (!campaign) {
        throw new BadRequestError('Campaign not found');
      }
      if (campaign.status !== 'ACTIVE' || new Date(campaign.dueDate) < new Date()) {
        throw new BadRequestError('Cette campagne d\'évaluation est clôturée.');
      }

      if (userId) {
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
    }

    const evaluation = await evaluationsRepository.create(finalInput, userId, resolvedSchoolId);

    await auditService.log({
      schoolId: resolvedSchoolId!,
      userId,
      action: 'CREATE_EVALUATION',
      entity: 'Evaluation',
      entityId: evaluation.id,
      details: { classId: finalInput.classId, moduleId: finalInput.moduleId }
    });

    return evaluation;
  },

  async getById(id: string, userRole?: string, schoolId?: string | null, scopedCampusIds?: string[]) {
    const evaluation = await evaluationsRepository.findById(id, schoolId ?? null);
    if (!evaluation) throw new NotFoundError('Evaluation');
    if (
      scopedCampusIds &&
      scopedCampusIds.length > 0 &&
      evaluation.class?.campusId &&
      !scopedCampusIds.includes(evaluation.class.campusId)
    ) {
      throw new ForbiddenError('You do not have access to this evaluation');
    }

    // Scrub evaluator if anonymous and requester is not admin
    if (evaluation.isAnonymous && !['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole || '')) {
      evaluation.evaluator = null;
      evaluation.evaluatorId = null;
    }

    return evaluation;
  },

  async getAll(query: Record<string, unknown>, userRole?: string, schoolId?: string | null, userCampusIds?: string[], userId?: string) {
    const pagination = parsePagination(query);
    const filters: EvaluationFilters = {
      status:      query.status as EvaluationStatus | undefined,
      evaluatorId: (userRole === 'STUDENT' && userId) ? userId : (query.evaluatorId as string | undefined),
      reportId:    query.reportId as string | undefined,
      professorId: query.professorId as string | undefined,
      moduleId:    query.moduleId as string | undefined,
      classId:     query.classId as string | undefined,
      campusId:    query.campusId as string | undefined,
      startDate:   query.startDate as string | undefined,
      endDate:     query.endDate as string | undefined,
      campaignId:  query.campaignId as string | undefined,
    };
    const scopedCampusIds = this.resolveScopedCampusFilter(userRole, userCampusIds, filters.campusId);
    if (scopedCampusIds && scopedCampusIds.length > 0) {
      delete filters.campusId;
      filters.campusIds = scopedCampusIds;
    }
    const { items, total } = await evaluationsRepository.findAll(filters, pagination, schoolId ?? null);

    // Filter anonymous evaluators for non-admins
    if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole || '')) {
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
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    const evaluation = await evaluationsRepository.findById(id, schoolId ?? null);
    if (!evaluation) throw new NotFoundError('Evaluation');

    if (evaluation.evaluatorId !== userId && !['ADMIN', 'MANAGER', 'AGENT'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to update this evaluation');
    }

    const result = await evaluationsRepository.update(id, input, schoolId ?? null);

    await auditService.log({
      schoolId: schoolId as string,
      userId,
      action: 'UPDATE_EVALUATION',
      entity: 'Evaluation',
      entityId: id,
    });

    return result;
  },

  async delete(id: string, userRole: string, schoolId?: string | null, userId?: string) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    if (!['ADMIN', 'MANAGER'].includes(userRole)) throw new ForbiddenError('Only ADMIN or MANAGER can delete evaluations');
    const exists = await evaluationsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Evaluation');
    
    const result = await evaluationsRepository.delete(id, schoolId ?? null);

    await auditService.log({
      schoolId: schoolId as string,
      userId,
      action: 'DELETE_EVALUATION',
      entity: 'Evaluation',
      entityId: id,
    });

    return result;
  },

  async getStats(query: Record<string, unknown>, schoolId?: string | null, userRole?: string, userCampusIds?: string[]) {
    const filters: EvaluationFilters = {
      reportId:    query.reportId as string | undefined,
      professorId: query.professorId as string | undefined,
      moduleId:    query.moduleId as string | undefined,
      classId:     query.classId as string | undefined,
      campusId:    query.campusId as string | undefined,
      startDate:   query.startDate as string | undefined,
      endDate:     query.endDate as string | undefined,
    };
    const scopedCampusIds = this.resolveScopedCampusFilter(userRole, userCampusIds, filters.campusId);
    if (scopedCampusIds && scopedCampusIds.length > 0) {
      delete filters.campusId;
      filters.campusIds = scopedCampusIds;
    }
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
