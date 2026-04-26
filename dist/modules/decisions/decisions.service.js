"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionsService = void 0;
const decisions_repository_1 = require("./decisions.repository");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
const queue_1 = require("../../core/config/queue");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const reports_repository_1 = require("../reports/reports.repository");
exports.decisionsService = {
    async create(input, userId, userRole, schoolId) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can create decisions');
        }
        const decision = await decisions_repository_1.decisionsRepository.create(input, userId, schoolId ?? null);
        if (schoolId) {
            await audit_service_1.auditService.log({
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
            await queue_1.jobQueue.add('ai-analysis', {
                type: 'decision-suggestion',
                decisionId: decision.id,
            });
        }
        catch (error) {
            console.warn('⚠️ Could not enqueue AI suggestion (Redis down?):', error);
        }
        // ── NOTIFY REPORT AUTHOR ──
        if (decision.reportId) {
            const report = await reports_repository_1.reportsRepository.findById(decision.reportId, schoolId ?? null);
            if (report) {
                const uti = report.deviceMetadata?.uti;
                notifications_service_1.notificationService.create({
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
    async getById(id, schoolId) {
        const decision = await decisions_repository_1.decisionsRepository.findById(id, schoolId ?? null);
        if (!decision)
            throw new AppError_1.NotFoundError('Decision');
        return decision;
    },
    async getAll(query, schoolId) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            status: query.status,
            deciderId: query.deciderId,
            startDate: query.startDate,
            endDate: query.endDate,
        };
        const { items, total } = await decisions_repository_1.decisionsRepository.findAll(filters, pagination, schoolId ?? null);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async update(id, input, userRole, schoolId, userId) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can update decisions');
        }
        const exists = await decisions_repository_1.decisionsRepository.existsById(id, schoolId ?? null);
        if (!exists)
            throw new AppError_1.NotFoundError('Decision');
        const result = await decisions_repository_1.decisionsRepository.update(id, input, schoolId ?? null);
        if (schoolId) {
            await audit_service_1.auditService.log({
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
    async updateStatus(id, status, userRole, schoolId, userId) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can change decision status');
        }
        const exists = await decisions_repository_1.decisionsRepository.existsById(id, schoolId ?? null);
        if (!exists)
            throw new AppError_1.NotFoundError('Decision');
        const result = await decisions_repository_1.decisionsRepository.updateStatus(id, status, schoolId ?? null);
        if (schoolId) {
            await audit_service_1.auditService.log({
                schoolId,
                userId,
                action: 'UPDATE_DECISION_STATUS',
                entity: 'Decision',
                entityId: id,
                details: { newStatus: status }
            });
        }
        // ── Notify student about decision status change ──
        const decisionFull = await decisions_repository_1.decisionsRepository.findById(id, schoolId ?? null);
        if (decisionFull?.reportId) {
            const report = await reports_repository_1.reportsRepository.findById(decisionFull.reportId, schoolId ?? null);
            if (report) {
                const uti = report.deviceMetadata?.uti;
                notifications_service_1.notificationService.create({
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
    async delete(id, userRole, schoolId, userId) {
        if (userRole !== 'ADMIN')
            throw new AppError_1.ForbiddenError('Only ADMIN can delete decisions');
        const exists = await decisions_repository_1.decisionsRepository.existsById(id, schoolId ?? null);
        if (!exists)
            throw new AppError_1.NotFoundError('Decision');
        const result = await decisions_repository_1.decisionsRepository.delete(id, schoolId ?? null);
        if (schoolId) {
            await audit_service_1.auditService.log({
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
//# sourceMappingURL=decisions.service.js.map