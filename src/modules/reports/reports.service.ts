import { ReportStatus } from '@prisma/client';
import { reportsRepository } from './reports.repository';
import { classModulesRepository } from '../class-modules/class-modules.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { jobQueue } from '../../core/config/queue';
import type { CreateReportInput, UpdateReportInput, ReportFilters } from './reports.types';
import { prisma } from '../../core/database/prisma';
import { auditService } from '../audit/audit.service';
import { notificationService } from '../notifications/notifications.service';
import { logger } from '../../utils/logger';


export const reportsService = {
  async create(input: CreateReportInput, userId?: string, schoolId?: string | null) {
    let finalInput = { ...input };

    // 1. User Context auto-fill
    if (userId && !finalInput.classId) {
      const user = await reportsRepository.getUserContext(userId);
      if (user) {
        finalInput.classId = user.classId || undefined;
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

    // 2. Cross-validation using the Triple-Link structure (tenant-scoped)
    if (finalInput.moduleId && finalInput.classId) {
      if (!resolvedSchoolId) {
        throw new BadRequestError('School context is required');
      }
      const assignment = await classModulesRepository.findByClassAndModule(
        finalInput.classId,
        finalInput.moduleId,
        resolvedSchoolId,
      );

      if (!assignment) {
        throw new BadRequestError('This module is not assigned to the selected class');
      }

      if (finalInput.professorId) {
        const isAssigned = assignment.professors.some((p: { id: string }) => p.id === finalInput.professorId);
        if (!isAssigned) {
          throw new BadRequestError('This professor is not assigned to this module for this class');
        }
      }
    }

    const report = await reportsRepository.create(finalInput, userId, resolvedSchoolId);

    if (resolvedSchoolId) {
      await auditService.log({
        schoolId: resolvedSchoolId,
        userId,
        action: 'CREATE_REPORT',
        entity: 'Report',
        entityId: report.id,
        details: { title: report.title, type: report.type }
      });
    }

    // 4. Notify School Managers/Admins
    if (resolvedSchoolId) {
      const isSuggestion = finalInput.type === 'SUGGESTION';
      const notifTitle = isSuggestion
        ? `💡 Nouvelle suggestion : "${report.title}"`
        : `🚨 Nouveau signalement : "${report.title}"`;
      const notifMessage = isSuggestion
        ? `Un étudiant a soumis une suggestion.`
        : `Un nouveau signalement de type ${report.type?.replace('_', ' ')} a été reçu.`;

      notificationService.sendBroadcast(resolvedSchoolId, {
        title: notifTitle,
        message: notifMessage,
        targetRoles: ['ADMIN', 'MANAGER'],
        url: `/dashboard/reports/${report.id}`,
      }).catch(err => console.warn('[Notification] Failed to notify managers', err));
    }

    // 3. Automatic AI Trigger
    try {
      await jobQueue.add('ai-analysis', {
        type: 'report-analysis',
        reportId: report.id,
      });
    } catch (error) {
      console.warn('⚠️ Could not auto-enqueue AI analysis (Redis down?):', error);
    }

    return report;
  },

  async getById(id: string, userRole?: string, schoolId?: string | null) {
    const report = await reportsRepository.findById(id, schoolId ?? null);
    if (!report) throw new NotFoundError('Report');

    // Scrub author if anonymous and requester is not admin
    if (report.isAnonymous && !['ADMIN', 'SUPERADMIN'].includes(userRole || '')) {
      report.author = null;
      report.authorId = null;
    }

    return report;
  },

  async getAll(query: Record<string, unknown>, userRole?: string, schoolId?: string | null) {
    const pagination = parsePagination(query);

    const filters: ReportFilters = {
      status: query.status as ReportStatus | undefined,
      authorId: query.authorId as string | undefined,
      campusId: query.campusId as string | undefined,
      classId: query.classId as string | undefined,
      professorId: query.professorId as string | undefined,
      moduleId: query.moduleId as string | undefined,
      priority: query.priority as ReportFilters['priority'],
      startDate: query.startDate as string | undefined,
      endDate: query.endDate as string | undefined,
      search: query.search as string | undefined,
    };

    const { items, total } = await reportsRepository.findAll(filters, pagination, schoolId ?? null);

    // Filter anonymous authors for non-admins
    if (!['ADMIN', 'SUPERADMIN'].includes(userRole || '')) {
      items.forEach((item: any) => {
        if (item.isAnonymous) {
          item.author = null;
          item.authorId = null;
        }
      });
    }

    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async update(id: string, input: UpdateReportInput, userId: string, userRole: string, schoolId?: string | null) {
    const report = await reportsRepository.findById(id, schoolId ?? null);
    if (!report) throw new NotFoundError('Report');

    // Only the author or admin/manager can update
    if (report.authorId !== userId && !['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to update this report');
    }

    const updated = await reportsRepository.update(id, input, schoolId ?? null);
    
    if (schoolId) {
      await auditService.log({
        schoolId,
        userId,
        action: 'UPDATE_REPORT',
        entity: 'Report',
        entityId: id,
        details: { updatedFields: Object.keys(input) }
      });
    }
    
    return updated;
  },

  async updateStatus(id: string, status: ReportStatus, userRole: string, schoolId?: string | null, userId?: string) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can change report status');
    }
    const exists = await reportsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Report');
    
    const result = await reportsRepository.updateStatus(id, status, schoolId ?? null);

    if (schoolId) {
      await auditService.log({
        schoolId,
        userId,
        action: 'UPDATE_REPORT_STATUS',
        entity: 'Report',
        entityId: id,
        details: { newStatus: status }
      });
    }

    // Notify author of status change
    const report = await reportsRepository.findById(id, schoolId ?? null);
    if (report) {
      const uti = (report.deviceMetadata as any)?.uti;
      const isSuggestion = report.type === 'SUGGESTION';
      const notifTitle = isSuggestion
        ? `💡 Mise à jour de votre suggestion`
        : `📢 Mise à jour de votre signalement`;
      const notifMessage = isSuggestion
        ? `Votre suggestion "${report.title}" a changé de statut : ${status}.`
        : `Votre signalement "${report.title}" a changé de statut : ${status}.`;

      notificationService.create({
        title: notifTitle,
        message: notifMessage,
        type: 'REPORT_STATUS_CHANGED',
        userId: report.authorId,
        targetDeviceUti: uti,
        schoolId: report.schoolId,
        url: `/dashboard/reports/${report.id}`,
      }).then(() => {
        logger.info('[ReportsService] Notification sent to author', { 
          reportId: report.id, 
          authorId: report.authorId,
          uti,
          isSuggestion,
        });

      }).catch(err => logger.warn('[Notification] Failed to notify author', { error: err }));

    }

    return result;
  },

  async delete(id: string, userRole: string, schoolId?: string | null, userId?: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenError('Only ADMIN can delete reports');
    }
    const exists = await reportsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Report');
    
    const result = await reportsRepository.delete(id, schoolId ?? null);

    if (schoolId) {
      await auditService.log({
        schoolId,
        userId,
        action: 'DELETE_REPORT',
        entity: 'Report',
        entityId: id,
      });
    }

    return result;
  },

  async triggerAiAnalysis(id: string, userRole: string, schoolId?: string | null) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can trigger AI analysis');
    }
    const exists = await reportsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Report');

    try {
      await jobQueue.add('ai-analysis', {
        type: 'report-analysis',
        reportId: id,
      });
    } catch (error) {
      console.warn('⚠️ Could not enqueue AI report analysis (Redis down?):', error);
    }

    return { queued: true, reportId: id };
  },

  async getMyReports(userId: string, query: Record<string, unknown>, schoolId?: string | null) {
    const pagination = parsePagination(query);
    const filters: ReportFilters = {
      ...query,
      authorId: userId,
    };
    const { items, total } = await reportsRepository.findAll(filters, pagination, schoolId ?? null);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },
};
