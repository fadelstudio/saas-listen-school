"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = void 0;
const reports_repository_1 = require("./reports.repository");
const class_modules_repository_1 = require("../class-modules/class-modules.repository");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
const queue_1 = require("../../core/config/queue");
const prisma_1 = require("../../core/database/prisma");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
exports.reportsService = {
    async create(input, userId, schoolId) {
        let finalInput = { ...input };
        // 1. User Context auto-fill
        if (userId && !finalInput.classId) {
            const user = await reports_repository_1.reportsRepository.getUserContext(userId);
            if (user) {
                finalInput.classId = user.classId || undefined;
            }
        }
        let resolvedSchoolId = schoolId ?? null;
        if (!resolvedSchoolId && finalInput.classId) {
            const cls = await prisma_1.prisma.class.findUnique({
                where: { id: finalInput.classId },
                select: { campus: { select: { schoolId: true } } },
            });
            resolvedSchoolId = cls?.campus?.schoolId ?? null;
        }
        // 2. Cross-validation using the Triple-Link structure (tenant-scoped)
        if (finalInput.moduleId && finalInput.classId) {
            if (!resolvedSchoolId) {
                throw new AppError_1.BadRequestError('School context is required');
            }
            const assignment = await class_modules_repository_1.classModulesRepository.findByClassAndModule(finalInput.classId, finalInput.moduleId, resolvedSchoolId);
            if (!assignment) {
                throw new AppError_1.BadRequestError('This module is not assigned to the selected class');
            }
            if (finalInput.professorId) {
                const isAssigned = assignment.professors.some((p) => p.id === finalInput.professorId);
                if (!isAssigned) {
                    throw new AppError_1.BadRequestError('This professor is not assigned to this module for this class');
                }
            }
        }
        const report = await reports_repository_1.reportsRepository.create(finalInput, userId, resolvedSchoolId);
        if (resolvedSchoolId) {
            await audit_service_1.auditService.log({
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
            notifications_service_1.notificationService.sendBroadcast(resolvedSchoolId, {
                title: 'Nouveau signalement',
                message: `Un nouveau signalement "${report.title}" a été reçu.`,
                targetRoles: ['ADMIN', 'MANAGER'],
                url: `/dashboard/reports/${report.id}`,
            }).catch(err => console.warn('[Notification] Failed to notify managers', err));
        }
        // 3. Automatic AI Trigger
        try {
            await queue_1.jobQueue.add('ai-analysis', {
                type: 'report-analysis',
                reportId: report.id,
            });
        }
        catch (error) {
            console.warn('⚠️ Could not auto-enqueue AI analysis (Redis down?):', error);
        }
        return report;
    },
    async getById(id, userRole, schoolId) {
        const report = await reports_repository_1.reportsRepository.findById(id, schoolId ?? null);
        if (!report)
            throw new AppError_1.NotFoundError('Report');
        // Scrub author if anonymous and requester is not admin
        if (report.isAnonymous && !['ADMIN', 'SUPERADMIN'].includes(userRole || '')) {
            report.author = null;
            report.authorId = null;
        }
        return report;
    },
    async getAll(query, userRole, schoolId) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            status: query.status,
            authorId: query.authorId,
            campusId: query.campusId,
            classId: query.classId,
            professorId: query.professorId,
            moduleId: query.moduleId,
            priority: query.priority,
            startDate: query.startDate,
            endDate: query.endDate,
            search: query.search,
        };
        const { items, total } = await reports_repository_1.reportsRepository.findAll(filters, pagination, schoolId ?? null);
        // Filter anonymous authors for non-admins
        if (!['ADMIN', 'SUPERADMIN'].includes(userRole || '')) {
            items.forEach((item) => {
                if (item.isAnonymous) {
                    item.author = null;
                    item.authorId = null;
                }
            });
        }
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async update(id, input, userId, userRole, schoolId) {
        const report = await reports_repository_1.reportsRepository.findById(id, schoolId ?? null);
        if (!report)
            throw new AppError_1.NotFoundError('Report');
        // Only the author or admin/manager can update
        if (report.authorId !== userId && !['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('You do not have permission to update this report');
        }
        const updated = await reports_repository_1.reportsRepository.update(id, input, schoolId ?? null);
        if (schoolId) {
            await audit_service_1.auditService.log({
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
    async updateStatus(id, status, userRole, schoolId, userId) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can change report status');
        }
        const exists = await reports_repository_1.reportsRepository.existsById(id, schoolId ?? null);
        if (!exists)
            throw new AppError_1.NotFoundError('Report');
        const result = await reports_repository_1.reportsRepository.updateStatus(id, status, schoolId ?? null);
        if (schoolId) {
            await audit_service_1.auditService.log({
                schoolId,
                userId,
                action: 'UPDATE_REPORT_STATUS',
                entity: 'Report',
                entityId: id,
                details: { newStatus: status }
            });
        }
        // Notify author of status change
        const report = await reports_repository_1.reportsRepository.findById(id, schoolId ?? null);
        if (report) {
            const uti = report.deviceMetadata?.uti;
            notifications_service_1.notificationService.create({
                title: '📢 Mise à jour de votre signalement',
                message: `Le statut de votre signalement "${report.title}" vient de passer à : ${status}.`,
                type: 'REPORT_STATUS_CHANGED',
                userId: report.authorId,
                targetDeviceUti: uti,
                schoolId: report.schoolId,
                url: `/dashboard/reports/${report.id}`,
            }).catch(err => console.warn('[Notification] Failed to notify author', err));
        }
        return result;
    },
    async delete(id, userRole, schoolId, userId) {
        if (userRole !== 'ADMIN') {
            throw new AppError_1.ForbiddenError('Only ADMIN can delete reports');
        }
        const exists = await reports_repository_1.reportsRepository.existsById(id, schoolId ?? null);
        if (!exists)
            throw new AppError_1.NotFoundError('Report');
        const result = await reports_repository_1.reportsRepository.delete(id, schoolId ?? null);
        if (schoolId) {
            await audit_service_1.auditService.log({
                schoolId,
                userId,
                action: 'DELETE_REPORT',
                entity: 'Report',
                entityId: id,
            });
        }
        return result;
    },
    async triggerAiAnalysis(id, userRole, schoolId) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can trigger AI analysis');
        }
        const exists = await reports_repository_1.reportsRepository.existsById(id, schoolId ?? null);
        if (!exists)
            throw new AppError_1.NotFoundError('Report');
        try {
            await queue_1.jobQueue.add('ai-analysis', {
                type: 'report-analysis',
                reportId: id,
            });
        }
        catch (error) {
            console.warn('⚠️ Could not enqueue AI report analysis (Redis down?):', error);
        }
        return { queued: true, reportId: id };
    },
};
//# sourceMappingURL=reports.service.js.map