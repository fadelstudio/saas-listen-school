"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCampaignReminderLoop = startCampaignReminderLoop;
const prisma_1 = require("../core/database/prisma");
const logger_1 = require("../utils/logger");
const notifications_service_1 = require("../modules/notifications/notifications.service");
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const RUN_EVERY_MS = 60 * 60 * 1000; // hourly
async function runEvaluationCampaignReminders() {
    const now = Date.now();
    const in3days = new Date(now + THREE_DAYS_MS);
    const in2days = new Date(now + TWO_DAYS_MS);
    // Only ACTIVE campaigns with deadline in 2-3 days
    const campaignsRaw = await prisma_1.prisma.evaluationCampaign.findMany({
        where: {
            status: 'ACTIVE',
            dueDate: {
                gte: in2days,
                lte: in3days,
            },
        },
        take: 50,
    });
    const campaigns = campaignsRaw;
    for (const c of campaigns) {
        let studentIds = [];
        if (c.scope === 'CLASS') {
            if (c.classId) {
                const users = await prisma_1.prisma.user.findMany({
                    where: { classId: c.classId, role: 'STUDENT' },
                    select: { id: true },
                });
                studentIds = users.map((u) => u.id);
            }
        }
        else if (c.scope === 'CAMPUS') {
            if (c.campusId) {
                const users = await prisma_1.prisma.user.findMany({
                    where: { campusId: c.campusId, role: 'STUDENT' },
                    select: { id: true },
                });
                studentIds = users.map((u) => u.id);
            }
        }
        else if (c.scope === 'SCHOOL') {
            const users = await prisma_1.prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } });
            studentIds = users.map((u) => u.id);
        }
        if (studentIds.length === 0)
            continue;
        // Find students who already submitted an evaluation for this campaign
        const done = await prisma_1.prisma.evaluation.findMany({
            where: {
                campaignId: c.id,
                evaluatorId: { in: studentIds },
            },
            select: { evaluatorId: true },
        });
        const doneSet = new Set(done.map((e) => e.evaluatorId).filter(Boolean));
        const missing = studentIds.filter((id) => !doneSet.has(id));
        if (missing.length === 0)
            continue;
        const module = await prisma_1.prisma.module.findUnique({ where: { id: c.moduleId }, select: { name: true } });
        const moduleName = module?.name ?? 'module';
        // Send ONE reminder per student (unique constraint prevents duplicates)
        await Promise.all(missing.map((userId) => notifications_service_1.notificationService
            .create({
            title: `Rappel: évaluation à compléter — ${c.title}`,
            message: `Deadline bientôt: merci de compléter l’évaluation pour le module ${moduleName}.`,
            type: 'EVALUATION_CAMPAIGN_REMINDER',
            userId,
            campaignId: c.id,
        })
            .catch((e) => logger_1.logger.warn('Failed to create campaign reminder notification', {
            campaignId: c.id,
            userId,
            error: e,
        }))));
    }
}
let started = false;
function startCampaignReminderLoop() {
    if (started)
        return;
    started = true;
    logger_1.logger.info('Worker running (EvaluationCampaign reminders loop)');
    // Kick once at startup, then repeat
    runEvaluationCampaignReminders().catch((e) => logger_1.logger.warn('EvaluationCampaign reminders loop failed', { error: e }));
    setInterval(() => {
        runEvaluationCampaignReminders().catch((e) => logger_1.logger.warn('EvaluationCampaign reminders loop failed', { error: e }));
    }, RUN_EVERY_MS);
}
//# sourceMappingURL=campaign-reminder.worker.js.map