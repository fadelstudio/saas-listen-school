import { evaluationCampaignsRepository } from './evaluation-campaigns.repository';
import { notificationService } from '../notifications/notifications.service';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../core/errors/AppError';
import { logger } from '../../utils/logger';
import { prisma } from '../../core/database/prisma';
import type { CreateEvaluationCampaignInput } from './evaluation-campaigns.schema';
import type { EvaluationCampaignFilters } from './evaluation-campaigns.types';
import { auditService } from '../audit/audit.service';

/**
 * Vérifie qu'un professeur appartient à l'école.
 * Un professeur appartient à l'école si :
 *   1. Son compte User lié a schoolId correspondant, OU
 *   2. Il a au moins une assignation ClassModule dans un campus de cette école.
 * Les profs sans userId et sans assignation sont rejetés (pas d'école connue).
 */
async function assertProfessorInSchool(professorId: string, schoolId: string) {
  const p = await prisma.professor.findFirst({
    where: {
      id: professorId,
      OR: [
        { user: { schoolId } },
        { modules: { some: { class: { campus: { schoolId } } } } },
      ],
    },
  });
  if (!p) throw new BadRequestError('Professor not found in this school');
}

export const evaluationCampaignsService = {
  async create(
    data: CreateEvaluationCampaignInput, 
    schoolId: string, 
    userRole?: string,
    userCampusIds?: string[],
    userId?: string
  ) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    
    if (data.scope === 'CLASS') {
      const module = await prisma.module.findFirst({
        where: { id: data.moduleId!, schoolId },
      });
      if (!module) throw new BadRequestError('Module not found in this school');

      await assertProfessorInSchool(data.professorId!, schoolId);

      const cls = await prisma.class.findFirst({
        where: { 
          id: data.classId!, 
          campus: { schoolId },
          ...(userCampusIds && userCampusIds.length > 0 ? { campusId: { in: userCampusIds } } : {}),
        },
      });
      if (!cls) throw new BadRequestError('Class not found or outside your scope');
    }

    if (data.scope === 'CAMPUS') {
      if (userCampusIds && userCampusIds.length > 0 && !userCampusIds.includes(data.campusId!)) {
        throw new ForbiddenError('Campus is outside your scope');
      }
      const campus = await prisma.campus.findFirst({
        where: { id: data.campusId!, schoolId },
      });
      if (!campus) throw new BadRequestError('Campus not found in this school');
    }

    if (data.scope === 'SCHOOL' && userRole !== 'SUPERADMIN' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only administrators can create school-wide campaigns');
    }

    const campaign = await evaluationCampaignsRepository.create({
      ...data,
      dueDate: new Date(data.dueDate),
    });

    await notificationService
      .create({
        title: `Campagne créée: ${campaign.title}`,
        message: `Une nouvelle campagne d'évaluation a été créée.`,
        type: 'EVALUATION_CAMPAIGN',
        campaignId: campaign.id,
        schoolId,
      })
      .catch((e) => logger.error('Failed to create global campaign notification', { error: e }));

    const detailedCampaignRaw = await evaluationCampaignsRepository.findById(campaign.id, schoolId);
    const detailedCampaign = detailedCampaignRaw as unknown as {
      scope: 'CLASS' | 'CAMPUS' | 'SCHOOL';
      class?: { users: { id: string }[] } | null;
      campus?: { users: { id: string; role: string }[] } | null;
      module?: { name: string };
    } | null;

    if (detailedCampaign) {
      let studentIds: string[] = [];

      if (detailedCampaign.scope === 'CLASS' && detailedCampaign.class?.users) {
        studentIds = detailedCampaign.class.users.map((u: { id: string }) => u.id);
      } else if (detailedCampaign.scope === 'CAMPUS') {
        studentIds = (detailedCampaign.campus?.users ?? [])
          .filter((u: { id: string; role: string }) => u.role === 'STUDENT')
          .map((u: { id: string }) => u.id);
      } else if (detailedCampaign.scope === 'SCHOOL') {
        const users = await prisma.user.findMany({
          where: { role: 'STUDENT', schoolId },
          select: { id: true },
        });
        studentIds = users.map((u) => u.id);
      }

      await notificationService.create({
        title: `Nouvelle évaluation demandée: ${campaign.title}`,
        message: detailedCampaign.module
          ? `Votre administration sollicite votre avis pour le module ${detailedCampaign.module.name}. Cliquez ici pour participer.`
          : `Votre administration sollicite votre avis concernant "${campaign.title}". Cliquez ici pour participer.`,
        type: 'EVALUATION_CAMPAIGN',
        targetUserIds: studentIds,
        campaignId: campaign.id,
        schoolId,
      }).then(() => {
        logger.info('[CampaignService] Targeted notifications sent', {
          campaignId: campaign.id,
          studentCount: studentIds.length
        });
      }).catch((e) => logger.error('Failed to send campaign notifications (bulk)', { error: e }));
    }

    await auditService.log({
      schoolId,
      userId,
      action: 'CREATE_CAMPAIGN',
      entity: 'EvaluationCampaign',
      entityId: campaign.id,
      details: { title: campaign.title, scope: campaign.scope }
    });

    return campaign;
  },

  async getAll(
    schoolId: string,
    query: Record<string, unknown>,
    userRole?: string,
    userClassId?: string,
    userCampusIds?: string[],
    userId?: string
  ) {
    const pagination = parsePagination(query);

    // Default filters
    const filters: EvaluationCampaignFilters = {
      scope: typeof query.scope === 'string' ? (query.scope as EvaluationCampaignFilters['scope']) : undefined,
      status: typeof query.status === 'string' ? query.status : undefined,
    };

    // If student, we force a complex OR filter to include all relevant scopes
    if (userRole === 'STUDENT') {
      // For students, we don't just filter by classId in an AND way, 
      // we want campaigns that are (SCHOOL) OR (CAMPUS + userCampusId) OR (CLASS + userClassId)
      const { items, total } = await evaluationCampaignsRepository.findAllForStudent(schoolId, {
        classId: userClassId,
        campusIds: userCampusIds,
        status: filters.status || undefined, // Repository already handles ACTIVE/COMPLETED logic if needed
      }, pagination, userId);
      return buildPaginated(items, total, pagination.page, pagination.limit);
    }


    // For non-students (ADMIN/MANAGER), use standard filtering
    filters.classId = typeof query.classId === 'string' ? query.classId : undefined;
    filters.campusId = typeof query.campusId === 'string' ? query.campusId : undefined;
    if (['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'].includes(userRole || '') && userCampusIds && userCampusIds.length > 0) {
      if (filters.campusId && !userCampusIds.includes(filters.campusId)) {
        throw new BadRequestError('Requested campus is outside your scope');
      }
      if (!filters.campusId) {
        filters.campusIds = userCampusIds;
      }
    }

    const { items, total } = await evaluationCampaignsRepository.findAll(schoolId, filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },



  async getById(id: string, schoolId: string) {
    const campaign = await evaluationCampaignsRepository.findById(id, schoolId);
    if (!campaign) throw new NotFoundError('EvaluationCampaign');
    return campaign;
  },

  async close(id: string, schoolId: string, userRole?: string, userCampusIds?: string[], userId?: string) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    const campaign = await evaluationCampaignsRepository.findById(id, schoolId);
    if (!campaign) throw new NotFoundError('EvaluationCampaign');

    // Scoping check
    if (userCampusIds && userCampusIds.length > 0) {
      if (campaign.scope === 'CAMPUS' && campaign.campusId && !userCampusIds.includes(campaign.campusId)) {
        throw new ForbiddenError('This campaign belongs to a campus outside your scope');
      }
      if (campaign.scope === 'CLASS' && campaign.class?.campusId && !userCampusIds.includes(campaign.class.campusId)) {
        throw new ForbiddenError('This campaign belongs to a class outside your scope');
      }
    }

    const updated = await evaluationCampaignsRepository.updateStatus(id, schoolId, 'COMPLETED');
    if (!updated) throw new NotFoundError('EvaluationCampaign');

    await auditService.log({
      schoolId,
      userId,
      action: 'CLOSE_CAMPAIGN',
      entity: 'EvaluationCampaign',
      entityId: id,
    });

    // Notify admins & managers that the campaign is closed and data is ready
    notificationService.sendBroadcast(schoolId, {
      title: '📊 Campagne clôturée — données disponibles',
      message: `La campagne "${(campaign as any).title}" est maintenant fermée. Les données sont disponibles pour analyse et prise de décision.`,
      targetRoles: ['ADMIN', 'MANAGER'],
      url: `/dashboard/evaluation-campaigns/${id}`,
    }).catch(e => logger.warn('[Notification] Campaign close notify failed', { error: e }));

    return updated;
  },

  async getAnalytics(id: string, schoolId: string) {
    const analytics = await evaluationCampaignsRepository.getAnalytics(id, schoolId);
    if (!analytics) throw new NotFoundError('EvaluationCampaign');

    const now = new Date();
    if (analytics.campaign.status === 'ACTIVE' && new Date(analytics.campaign.dueDate) < now) {
      await evaluationCampaignsRepository.updateStatus(id, schoolId, 'COMPLETED');
      analytics.campaign.status = 'COMPLETED';

      // Trigger global analysis if no decision exists
      if (!analytics.decision) {
        this.generatePostDeadlineAnalysis(id, 'SYSTEM', schoolId).catch(err =>
          logger.error('Auto-analysis failed', { error: err })
        );
      }
    }

    return analytics;
  },

  async sendReminders(id: string, schoolId: string, userRole?: string, userCampusIds?: string[], userId?: string) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    const campaignRaw = await evaluationCampaignsRepository.findById(id, schoolId);
    if (!campaignRaw) throw new NotFoundError('EvaluationCampaign');
    const campaign = campaignRaw as unknown as {
      id: string; title: string; scope: string; module?: { name: string };
      class?: { users: { id: string }[] }; campus?: { users: { id: string; role: string }[] };
    };

    let allStudentIds: string[] = [];
    if (campaign.scope === 'CLASS' && campaign.class?.users) {
      allStudentIds = campaign.class.users.map((u) => u.id);
    } else if (campaign.scope === 'CAMPUS') {
      allStudentIds = (campaign.campus?.users ?? []).filter(u => u.role === 'STUDENT').map((u) => u.id);
    } else if (campaign.scope === 'SCHOOL') {
      const users = await prisma.user.findMany({ where: { role: 'STUDENT', schoolId }, select: { id: true } });
      allStudentIds = users.map((u) => u.id);
    }

    const doneEvaluations = await prisma.evaluation.findMany({
      where: { campaignId: id, schoolId }, select: { evaluatorId: true },
    });
    const doneIds = new Set(doneEvaluations.map(e => e.evaluatorId).filter(Boolean));
    const missingIds = allStudentIds.filter(id => !doneIds.has(id));

    await notificationService.create({
      title: `Rappel: Évaluation requise pour ${campaign.title}`,
      message: campaign.module
        ? `N'oubliez pas de donner votre avis pour le module ${campaign.module.name}.`
        : `N'oubliez pas de donner votre avis concernant "${campaign.title}".`,
      type: 'EVALUATION_CAMPAIGN_REMINDER',
      targetUserIds: missingIds,
      campaignId: campaign.id,
      schoolId,
    }).then(() => {
      logger.info('[CampaignService] Reminders sent', {
        campaignId: campaign.id,
        studentCount: missingIds.length
      });
    }).catch((e) => logger.error('Failed to send campaign reminders (bulk)', { error: e }));

    await auditService.log({
      schoolId,
      userId,
      action: 'SEND_CAMPAIGN_REMINDERS',
      entity: 'EvaluationCampaign',
      entityId: id,
    });
  },

  async generatePostDeadlineAnalysis(id: string, userId: string, schoolId: string, userRole?: string) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    const analytics = await evaluationCampaignsRepository.getAnalytics(id, schoolId);
    if (!analytics) throw new NotFoundError('EvaluationCampaign');

    const { stats, campaign } = analytics;

    // 1. Check if a decision already exists
    const existing = await prisma.decision.findFirst({ where: { campaignId: id } as any });
    if (existing) return existing;

    // 2. Build context for AI
    const context = `
      Campagne: ${campaign.title}
      Périmètre: ${campaign.scope}
      ${campaign.module ? `Module: ${campaign.module.name}` : ''}
      ${campaign.professor ? `Professeur: ${campaign.professor.firstName} ${campaign.professor.lastName}` : ''}
      Stats: ${stats.totalDone}/${stats.totalExpected} participations (${stats.completionRate}%).
      Score Moyen Académique: ${stats.avgScore}/20.
      
      Liste des commentaires étudiants :
      ${campaign.evaluations.map((e: any) => `- [Note: ${e.score}/20] ${e.comment || 'Sans commentaire'}`).join('\n')}
    `;

    // 3. Call AI for Synthesis & Decision Suggestion
    // (In a real scenario, we'd use the job queue, but here we'll do it directly for the demo flow)
    const prompt = `Analyse les résultats de cette campagne d'évaluation et propose une décision administrative.
    Donne une réponse UNIQUEMENT en JSON strict.
    Format: {"summary":"Synthèse des points clés","recommendation":"Action suggérée (ex: Entretien de cadrage, Félicitations, Formation pédagogique)","priority":"HIGH|MEDIUM|LOW"}
    
    Données: ${context}`;

    const { aiBalancer } = await import('../../core/ai/AiBalancer');
    const aiRes = await aiBalancer.callAI(prompt, schoolId);

    let aiParsed;
    try {
      // Robust extraction as done in the processor
      const match = aiRes.content.match(/\{[\s\S]*\}/);
      aiParsed = JSON.parse(match ? match[0] : aiRes.content);
    } catch (e) {
      aiParsed = { summary: aiRes.content, recommendation: 'Analyse manuelle requise', priority: 'MEDIUM' };
    }

    // 4. Create the Decision
    const decision = await prisma.decision.create({
      data: {
        campaignId: id,
        deciderId: userId,
        schoolId,
        title: `Suivi suite à la campagne : ${campaign.title}`,
        rationale: aiParsed.summary,
        aiSuggestion: aiParsed.recommendation,
        status: 'PROPOSED',
        priority: aiParsed.priority === 'HIGH' ? 'HIGH' : (aiParsed.priority === 'LOW' ? 'LOW' : 'MEDIUM'),
      } as any,
      include: { decider: { select: { firstName: true, lastName: true } } }
    });

    // 5. Notify admins that the AI report is ready
    notificationService.sendBroadcast(schoolId, {
      title: '🤖 Rapport IA  généré — action requise',
      message: `L'analyse IA de la campagne "${campaign.title}" est prête. Une décision proposée a été générée automatiquement. Vérifiez et validez.`,
      targetRoles: ['ADMIN', 'MANAGER'],
      url: `/dashboard/decisions/${decision.id}`,
    }).catch(e => logger.warn('[Notification] Analytics ready notify failed', { error: e }));

    return decision;
  }
};
