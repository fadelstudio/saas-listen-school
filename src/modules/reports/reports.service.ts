import { ReportStatus } from '@prisma/client';
import { reportsRepository } from './reports.repository';
import { classModulesRepository } from '../class-modules/class-modules.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { jobQueue } from '../../core/config/queue';
import type { CreateReportInput, UpdateReportInput, ReportFilters } from './reports.types';
import { prisma } from '../../core/database/prisma';

export const reportsService = {
  async create(input: CreateReportInput, userId?: string, schoolId?: string | null) {
    let finalInput = { ...input };

    // 1. Cross-validation using the Triple-Link structure
    if (finalInput.moduleId && finalInput.classId) {
      const assignment = await classModulesRepository.findByClassAndModule(finalInput.classId, finalInput.moduleId);
      
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

    // 2. User Context auto-fill
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

    const report = await reportsRepository.create(finalInput, userId, resolvedSchoolId);

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
      status:      query.status as ReportStatus | undefined,
      authorId:    query.authorId as string | undefined,
      campusId:    query.campusId as string | undefined,
      classId:     query.classId as string | undefined,
      professorId: query.professorId as string | undefined,
      moduleId:    query.moduleId as string | undefined,
      priority:    query.priority as ReportFilters['priority'],
      startDate:   query.startDate as string | undefined,
      endDate:     query.endDate as string | undefined,
      search:      query.search as string | undefined,
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

    return reportsRepository.update(id, input, schoolId ?? null);
  },

  async updateStatus(id: string, status: ReportStatus, userRole: string, schoolId?: string | null) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can change report status');
    }
    const exists = await reportsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Report');
    return reportsRepository.updateStatus(id, status, schoolId ?? null);
  },

  async delete(id: string, userRole: string, schoolId?: string | null) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenError('Only ADMIN can delete reports');
    }
    const exists = await reportsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Report');
    return reportsRepository.delete(id, schoolId ?? null);
  },

  async triggerAiAnalysis(id: string, userRole: string, schoolId?: string | null) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can trigger AI analysis');
    }
    const exists = await reportsRepository.existsById(id, schoolId ?? null);
    if (!exists) throw new NotFoundError('Report');

    try {
      await jobQueue.add('ai-analysis', {
        type:     'report-analysis',
        reportId: id,
      });
    } catch (error) {
      console.warn('⚠️ Could not enqueue AI report analysis (Redis down?):', error);
    }

    return { queued: true, reportId: id };
  },
};
