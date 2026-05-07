import { DecisionStatus } from '@prisma/client';
import { decisionsRepository } from './decisions.repository';
import { NotFoundError, ForbiddenError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { jobQueue } from '../../core/config/queue';
import type { CreateDecisionInput, UpdateDecisionInput, DecisionFilters } from './decisions.types';
import { auditService } from '../audit/audit.service';
import { notificationService } from '../notifications/notifications.service';
import { reportsRepository } from '../reports/reports.repository';

export const decisionsService = {
  resolveScopedCampusIds(userRole?: string, userCampusIds?: string[]): string[] | undefined {
    if (!['ADMIN', 'MANAGER', 'VIEWER'].includes(userRole || '')) return undefined;
    if (!userCampusIds || userCampusIds.length === 0) return undefined;
    return userCampusIds;
  },

  async create(input: CreateDecisionInput, userId: string, userRole: string, schoolId?: string | null) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can create decisions');
    }

    const decision = await decisionsRepository.create(input, userId, schoolId ?? null);

    if (schoolId) {
      await auditService.log({
        schoolId,
        userId,
        action: 'CREATE_DECISION',
        entity: 'Decision',
        entityId: decision.id,
        details: { title: decision.title }
      });
    }

    // Automatically enqueue AI suggestion
    try {
      await jobQueue.add('ai-analysis', {
        type:       'decision-suggestion',
        decisionId: decision.id,
      });
    } catch (error) {
      console.warn('⚠️ Could not enqueue AI suggestion (Redis down?):', error);
    }

    // ── NOTIFY REPORT AUTHOR ──
    if (decision.reportId) {
      const report = await reportsRepository.findById(decision.reportId, schoolId ?? null);
      if (report) {
        const uti = (report.deviceMetadata as any)?.uti;
        notificationService.create({
          title: '✅ Décision prise sur votre signalement',
          message: `Une décision officielle a été publiée concernant votre signalement "${report.title}". Consultez-la pour en savoir plus.`,
          type: 'DECISION_TAKEN',
          userId: report.authorId,
          targetDeviceUti: uti,
          schoolId: decision.schoolId,
          url: `/dashboard/decisions/${decision.id}`,
        }).catch(err => console.warn('[Notification] Failed to notify author of decision', err));
      }
    }

    return decision;
  },

  async getById(id: string, schoolId?: string | null, scopedCampusIds?: string[]) {
    const decision = await decisionsRepository.findById(id, schoolId ?? null);
    if (!decision) throw new NotFoundError('Decision');
    if (scopedCampusIds && scopedCampusIds.length > 0) {
      const reportCampusId = (decision as any).report?.class?.campusId;
      const evaluationCampusId = (decision as any).evaluation?.class?.campusId;
      const campaignClassCampusId = (decision as any).campaign?.class?.campusId;
      const campaignCampusId = (decision as any).campaign?.campusId;
      const scoped = [reportCampusId, evaluationCampusId, campaignClassCampusId, campaignCampusId]
        .filter(Boolean)
        .some((c) => scopedCampusIds.includes(c));
      if (!scoped) throw new NotFoundError('Decision');
    }
    return decision;
  },

  async getAll(
    query: Record<string, unknown>,
    schoolId?: string | null,
    userRole?: string,
    userCampusIds?: string[]
  ) {
    const pagination = parsePagination(query);
    const filters: DecisionFilters = {
      status:    query.status as DecisionStatus | undefined,
      deciderId: query.deciderId as string | undefined,
      startDate: query.startDate as string | undefined,
      endDate:   query.endDate as string | undefined,
      campusIds: this.resolveScopedCampusIds(userRole, userCampusIds),
    };
    const { items, total } = await decisionsRepository.findAll(filters, pagination, schoolId ?? null);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async update(id: string, input: UpdateDecisionInput, userRole: string, schoolId?: string | null, userId?: string) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can update decisions');
    }
    const exists = await decisionsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Decision');
    
    const result = await decisionsRepository.update(id, input, schoolId ?? null);

    if (schoolId) {
      await auditService.log({
        schoolId,
        userId,
        action: 'UPDATE_DECISION',
        entity: 'Decision',
        entityId: id,
        details: { updatedFields: Object.keys(input) }
      });
    }

    return result;
  },

  async updateStatus(id: string, status: DecisionStatus, userRole: string, schoolId?: string | null, userId?: string) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can change decision status');
    }
    const exists = await decisionsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Decision');
    
    const result = await decisionsRepository.updateStatus(id, status, schoolId ?? null);

    if (schoolId) {
      await auditService.log({
        schoolId,
        userId,
        action: 'UPDATE_DECISION_STATUS',
        entity: 'Decision',
        entityId: id,
        details: { newStatus: status }
      });
    }

    // ── Notify student about decision status change ──
    const decisionFull = await decisionsRepository.findById(id, schoolId ?? null) as any;
    if (decisionFull?.reportId) {
      const report = await reportsRepository.findById(decisionFull.reportId, schoolId ?? null);
      if (report) {
        const uti = (report.deviceMetadata as any)?.uti;
        notificationService.create({
          title: '📋 Mise à jour de votre décision',
          message: `La décision liée à votre signalement "${report.title}" est passée au statut : ${status}.`,
          type: 'DECISION_TAKEN',
          userId: report.authorId,
          targetDeviceUti: uti,
          schoolId: report.schoolId,
          url: `/dashboard/decisions/${id}`,
        }).catch(err => console.warn('[Notification] Failed to notify about decision status', err));
      }
    }

    return result;
  },

  async delete(id: string, userRole: string, schoolId?: string | null, userId?: string) {
    if (userRole !== 'ADMIN') throw new ForbiddenError('Only ADMIN can delete decisions');
    const exists = await decisionsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Decision');
    
    const result = await decisionsRepository.delete(id, schoolId ?? null);

    if (schoolId) {
      await auditService.log({
        schoolId,
        userId,
        action: 'DELETE_DECISION',
        entity: 'Decision',
        entityId: id,
      });
    }

    return result;
  },
};
