import { DecisionStatus } from '@prisma/client';
import { decisionsRepository } from './decisions.repository';
import { NotFoundError, ForbiddenError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { jobQueue } from '../../core/config/queue';
import type { CreateDecisionInput, UpdateDecisionInput, DecisionFilters } from './decisions.types';

export const decisionsService = {
  async create(input: CreateDecisionInput, userId: string, userRole: string, schoolId?: string | null) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can create decisions');
    }

    const decision = await decisionsRepository.create(input, userId, schoolId ?? null);

    // Automatically enqueue AI suggestion
    try {
      await jobQueue.add('ai-analysis', {
        type:       'decision-suggestion',
        decisionId: decision.id,
      });
    } catch (error) {
      console.warn('⚠️ Could not enqueue AI suggestion (Redis down?):', error);
    }

    return decision;
  },

  async getById(id: string, schoolId?: string | null) {
    const decision = await decisionsRepository.findById(id, schoolId ?? null);
    if (!decision) throw new NotFoundError('Decision');
    return decision;
  },

  async getAll(query: Record<string, unknown>, schoolId?: string | null) {
    const pagination = parsePagination(query);
    const filters: DecisionFilters = {
      status:    query.status as DecisionStatus | undefined,
      deciderId: query.deciderId as string | undefined,
      startDate: query.startDate as string | undefined,
      endDate:   query.endDate as string | undefined,
    };
    const { items, total } = await decisionsRepository.findAll(filters, pagination, schoolId ?? null);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async update(id: string, input: UpdateDecisionInput, userRole: string, schoolId?: string | null) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can update decisions');
    }
    const exists = await decisionsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Decision');
    return decisionsRepository.update(id, input, schoolId ?? null);
  },

  async updateStatus(id: string, status: DecisionStatus, userRole: string, schoolId?: string | null) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can change decision status');
    }
    const exists = await decisionsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Decision');
    return decisionsRepository.updateStatus(id, status, schoolId ?? null);
  },

  async delete(id: string, userRole: string, schoolId?: string | null) {
    if (userRole !== 'ADMIN') throw new ForbiddenError('Only ADMIN can delete decisions');
    const exists = await decisionsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Decision');
    return decisionsRepository.delete(id, schoolId ?? null);
  },
};
