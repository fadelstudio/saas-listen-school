"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCampaignReminderLoop = startCampaignReminderLoop;
const prisma_1 = require("../core/database/prisma");
const logger_1 = require("../utils/logger");
const notifications_service_1 = require("../modules/notifications/notifications.service");
const evaluation_campaigns_repository_1 = require("../modules/evaluation-campaigns/evaluation-campaigns.repository");
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const RUN_EVERY_MS = 60 * 60 * 1000; // hourly
// ─────────────────────────────────────────────────────────────────────────────
// 1. Rappels 2 jours avant fermeture — envoyés aux étudiants qui n'ont pas
//    encore évalué (contrainte @@unique empêche les doublons).
// ─────────────────────────────────────────────────────────────────────────────
async function runEvaluationCampaignReminders() {
    const now = Date.now();
    const in2days = new Date(now + TWO_DAYS_MS);
    const in3days = new Date(now + THREE_DAYS_MS);
    const campaignsRaw = await prisma_1.prisma.evaluationCampaign.findMany({
        where: {
            status: 'ACTIVE',
            dueDate: { gte: in2days, lte: in3days },
        },
        take: 50,
    });
    const campaigns = campaignsRaw;
    for (const c of campaigns) {
        let studentIds = [];
        if (c.scope === 'CLASS' && c.classId) {
            const users = await prisma_1.prisma.user.findMany({
                where: { classId: c.classId, role: 'STUDENT' },
                select: { id: true },
            });
            studentIds = users.map((u) => u.id);
        }
        else if (c.scope === 'CAMPUS' && c.campusId) {
            const users = await prisma_1.prisma.user.findMany({
                where: { campuses: { some: { id: c.campusId } }, role: 'STUDENT' },
                select: { id: true },
            });
            studentIds = users.map((u) => u.id);
        }
        else if (c.scope === 'SCHOOL') {
            const where = { role: 'STUDENT' };
            if (c.schoolId)
                where.schoolId = c.schoolId;
            const users = await prisma_1.prisma.user.findMany({ where, select: { id: true } });
            studentIds = users.map((u) => u.id);
        }
        if (studentIds.length === 0)
            continue;
        const done = await prisma_1.prisma.evaluation.findMany({
            where: { campaignId: c.id, evaluatorId: { in: studentIds } },
            select: { evaluatorId: true },
        });
        const doneSet = new Set(done.map((e) => e.evaluatorId).filter(Boolean));
        let missing = studentIds.filter((id) => !doneSet.has(id));
        if (missing.length === 0)
            continue;
        // Remove users who have already received the reminder
        const existingNotifications = await prisma_1.prisma.notification.findMany({
            where: { campaignId: c.id, type: 'EVALUATION_CAMPAIGN_REMINDER', userId: { in: missing } },
            select: { userId: true }
        });
        const alreadyNotified = new Set(existingNotifications.map(n => n.userId).filter(Boolean));
        missing = missing.filter(id => !alreadyNotified.has(id));
        if (missing.length === 0)
            continue;
        const module = await prisma_1.prisma.module.findUnique({ where: { id: c.moduleId }, select: { name: true } });
        const moduleName = module?.name ?? 'votre module';
        await Promise.all(missing.map((userId) => notifications_service_1.notificationService
            .create({
            title: `⏰ Rappel : évaluation requise — ${c.title}`,
            message: `Il reste moins de 2 jours pour compléter l'évaluation du module "${moduleName}". Ne tardez pas !`,
            type: 'EVALUATION_CAMPAIGN_REMINDER',
            userId,
            campaignId: c.id,
            schoolId: c.schoolId,
            url: `/dashboard/evaluations?campaignId=${c.id}`,
        })
            .catch((e) => logger_1.logger.warn('[CampaignWorker] Reminder failed', { campaignId: c.id, userId, error: e }))));
        logger_1.logger.info(`[CampaignWorker] ${missing.length} reminders sent for campaign ${c.id}`);
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// 2. Clôture automatique des campagnes expirées + notification admin
// ─────────────────────────────────────────────────────────────────────────────
async function runExpiredCampaignClose() {
    const now = new Date();
    const expiredRaw = await prisma_1.prisma.evaluationCampaign.findMany({
        where: {
            status: 'ACTIVE',
            dueDate: { lt: now },
        },
        take: 50,
    });
    const expired = expiredRaw;
    for (const c of expired) {
        try {
            // Clôturer en base
            await evaluation_campaigns_repository_1.evaluationCampaignsRepository.updateStatus(c.id, c.schoolId ?? '', 'COMPLETED');
            logger_1.logger.info(`[CampaignWorker] Auto-closed expired campaign: ${c.id} (${c.title})`);
            // Notifier les admins/managers
            if (c.schoolId) {
                await notifications_service_1.notificationService.sendBroadcast(c.schoolId, {
                    title: '📊 Campagne clôturée automatiquement',
                    message: `La campagne "${c.title}" a été clôturée automatiquement (date de fin atteinte). Les données sont prêtes pour analyse et décision.`,
                    targetRoles: ['ADMIN', 'MANAGER'],
                    url: `/dashboard/evaluation-campaigns/${c.id}`,
                });
            }
        }
        catch (e) {
            logger_1.logger.warn('[CampaignWorker] Failed to auto-close campaign', { campaignId: c.id, error: e });
        }
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────
let started = false;
function startCampaignReminderLoop() {
    if (started)
        return;
    started = true;
    logger_1.logger.info('[CampaignWorker] Started — runs every hour (reminders + auto-close)');
    const run = async () => {
        await runEvaluationCampaignReminders().catch((e) => logger_1.logger.warn('[CampaignWorker] Reminders loop error', { error: e }));
        await runExpiredCampaignClose().catch((e) => logger_1.logger.warn('[CampaignWorker] Auto-close loop error', { error: e }));
    };
    // Run immediately at startup then every hour
    run();
    setInterval(run, RUN_EVERY_MS);
}
//# sourceMappingURL=campaign-reminder.worker.js.map