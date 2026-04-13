import { prisma } from '../core/database/prisma';
import { logger } from '../utils/logger';
import { notificationService } from '../modules/notifications/notifications.service';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const RUN_EVERY_MS = 60 * 60 * 1000; // hourly

async function runEvaluationCampaignReminders(): Promise<void> {
  const now = Date.now();
  const in3days = new Date(now + THREE_DAYS_MS);
  const in2days = new Date(now + TWO_DAYS_MS);

  // Only ACTIVE campaigns with deadline in 2-3 days
  const campaignsRaw = await prisma.evaluationCampaign.findMany({
    where: {
      status: 'ACTIVE',
      dueDate: {
        gte: in2days,
        lte: in3days,
      },
    },
    take: 50,
  });

  const campaigns = campaignsRaw as unknown as Array<{
    id: string;
    title: string;
    scope: 'CLASS' | 'CAMPUS' | 'SCHOOL';
    classId?: string | null;
    campusId?: string | null;
    moduleId: string;
  }>;

  for (const c of campaigns) {
    let studentIds: string[] = [];

    if (c.scope === 'CLASS') {
      if (c.classId) {
        const users = await prisma.user.findMany({
          where: { classId: c.classId, role: 'STUDENT' },
          select: { id: true },
        });
        studentIds = users.map((u) => u.id);
      }
    } else if (c.scope === 'CAMPUS') {
      if (c.campusId) {
        const users = await prisma.user.findMany({
          where: { campusId: c.campusId, role: 'STUDENT' },
          select: { id: true },
        });
        studentIds = users.map((u) => u.id);
      }
    } else if (c.scope === 'SCHOOL') {
      const users = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } });
      studentIds = users.map((u) => u.id);
    }

    if (studentIds.length === 0) continue;

    // Find students who already submitted an evaluation for this campaign
    const done = await prisma.evaluation.findMany({
      where: {
        campaignId: c.id,
        evaluatorId: { in: studentIds },
      },
      select: { evaluatorId: true },
    });

    const doneSet = new Set(done.map((e) => e.evaluatorId).filter(Boolean) as string[]);
    const missing = studentIds.filter((id) => !doneSet.has(id));

    if (missing.length === 0) continue;

    const module = await prisma.module.findUnique({ where: { id: c.moduleId }, select: { name: true } });
    const moduleName = module?.name ?? 'module';

    // Send ONE reminder per student (unique constraint prevents duplicates)
    await Promise.all(
      missing.map((userId) =>
        notificationService
          .create({
            title: `Rappel: évaluation à compléter — ${c.title}`,
            message: `Deadline bientôt: merci de compléter l’évaluation pour le module ${moduleName}.`,
            type: 'EVALUATION_CAMPAIGN_REMINDER',
            userId,
            campaignId: c.id,
          })
          .catch((e) =>
            logger.warn('Failed to create campaign reminder notification', {
              campaignId: c.id,
              userId,
              error: e,
            })
          )
      )
    );
  }
}

let started = false;

export function startCampaignReminderLoop(): void {
  if (started) return;
  started = true;

  logger.info('Worker running (EvaluationCampaign reminders loop)');

  // Kick once at startup, then repeat
  runEvaluationCampaignReminders().catch((e) =>
    logger.warn('EvaluationCampaign reminders loop failed', { error: e })
  );

  setInterval(() => {
    runEvaluationCampaignReminders().catch((e) =>
      logger.warn('EvaluationCampaign reminders loop failed', { error: e })
    );
  }, RUN_EVERY_MS);
}

