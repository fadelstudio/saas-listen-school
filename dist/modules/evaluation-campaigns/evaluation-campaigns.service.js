"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationCampaignsService = void 0;
const evaluation_campaigns_repository_1 = require("./evaluation-campaigns.repository");
const notifications_service_1 = require("../notifications/notifications.service");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
const logger_1 = require("../../utils/logger");
const prisma_1 = require("../../core/database/prisma");
/**
 * Vérifie qu'un professeur appartient à l'école.
 * Un professeur appartient à l'école si :
 *   1. Son compte User lié a schoolId correspondant, OU
 *   2. Il a au moins une assignation ClassModule dans un campus de cette école.
 * Les profs sans userId et sans assignation sont rejetés (pas d'école connue).
 */
async function assertProfessorInSchool(professorId, schoolId) {
    const p = await prisma_1.prisma.professor.findFirst({
        where: {
            id: professorId,
            OR: [
                { user: { schoolId } },
                { modules: { some: { class: { campus: { schoolId } } } } },
            ],
        },
    });
    if (!p)
        throw new AppError_1.BadRequestError('Professor not found in this school');
}
exports.evaluationCampaignsService = {
    async create(data, schoolId) {
        if (data.scope === 'CLASS') {
            const module = await prisma_1.prisma.module.findFirst({
                where: { id: data.moduleId, schoolId },
            });
            if (!module)
                throw new AppError_1.BadRequestError('Module not found in this school');
            await assertProfessorInSchool(data.professorId, schoolId);
            const cls = await prisma_1.prisma.class.findFirst({
                where: { id: data.classId, campus: { schoolId } },
            });
            if (!cls)
                throw new AppError_1.BadRequestError('Class not found in this school');
        }
        if (data.scope === 'CAMPUS') {
            const campus = await prisma_1.prisma.campus.findFirst({
                where: { id: data.campusId, schoolId },
            });
            if (!campus)
                throw new AppError_1.BadRequestError('Campus not found in this school');
        }
        const campaign = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.create({
            ...data,
            dueDate: new Date(data.dueDate),
        });
        await notifications_service_1.notificationService
            .create({
            title: `Campagne créée: ${campaign.title}`,
            message: `Une nouvelle campagne d'évaluation a été créée.`,
            type: 'EVALUATION_CAMPAIGN',
            campaignId: campaign.id,
            schoolId,
        })
            .catch((e) => logger_1.logger.error('Failed to create global campaign notification', { error: e }));
        const detailedCampaignRaw = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.findById(campaign.id, schoolId);
        const detailedCampaign = detailedCampaignRaw;
        if (detailedCampaign) {
            let studentIds = [];
            if (detailedCampaign.scope === 'CLASS' && detailedCampaign.class?.users) {
                studentIds = detailedCampaign.class.users.map((u) => u.id);
            }
            else if (detailedCampaign.scope === 'CAMPUS') {
                studentIds = (detailedCampaign.campus?.users ?? [])
                    .filter((u) => u.role === 'STUDENT')
                    .map((u) => u.id);
            }
            else if (detailedCampaign.scope === 'SCHOOL') {
                const users = await prisma_1.prisma.user.findMany({
                    where: { role: 'STUDENT', schoolId },
                    select: { id: true },
                });
                studentIds = users.map((u) => u.id);
            }
            await notifications_service_1.notificationService.create({
                title: `Nouvelle évaluation demandée: ${campaign.title}`,
                message: detailedCampaign.module
                    ? `Votre administration sollicite votre avis pour le module ${detailedCampaign.module.name}. Cliquez ici pour participer.`
                    : `Votre administration sollicite votre avis concernant "${campaign.title}". Cliquez ici pour participer.`,
                type: 'EVALUATION_CAMPAIGN',
                targetUserIds: studentIds,
                campaignId: campaign.id,
                schoolId,
            }).catch((e) => logger_1.logger.error('Failed to send campaign notifications (bulk)', { error: e }));
        }
        return campaign;
    },
    async getAll(schoolId, query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            classId: typeof query.classId === 'string' ? query.classId : undefined,
            campusId: typeof query.campusId === 'string' ? query.campusId : undefined,
            scope: typeof query.scope === 'string' ? query.scope : undefined,
            status: typeof query.status === 'string' ? query.status : undefined,
        };
        const { items, total } = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.findAll(schoolId, filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id, schoolId) {
        const campaign = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.findById(id, schoolId);
        if (!campaign)
            throw new AppError_1.NotFoundError('EvaluationCampaign');
        return campaign;
    },
    async close(id, schoolId) {
        const campaign = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.findById(id, schoolId);
        if (!campaign)
            throw new AppError_1.NotFoundError('EvaluationCampaign');
        const updated = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.updateStatus(id, schoolId, 'COMPLETED');
        if (!updated)
            throw new AppError_1.NotFoundError('EvaluationCampaign');
        // Notify admins & managers that the campaign is closed and data is ready
        notifications_service_1.notificationService.sendBroadcast(schoolId, {
            title: '📊 Campagne clôturée — données disponibles',
            message: `La campagne "${campaign.title}" est maintenant fermée. Les données sont disponibles pour analyse et prise de décision.`,
            targetRoles: ['ADMIN', 'MANAGER'],
            url: `/dashboard/evaluation-campaigns/${id}`,
        }).catch(e => logger_1.logger.warn('[Notification] Campaign close notify failed', { error: e }));
        return updated;
    },
    async getAnalytics(id, schoolId) {
        const analytics = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.getAnalytics(id, schoolId);
        if (!analytics)
            throw new AppError_1.NotFoundError('EvaluationCampaign');
        const now = new Date();
        if (analytics.campaign.status === 'ACTIVE' && new Date(analytics.campaign.dueDate) < now) {
            await evaluation_campaigns_repository_1.evaluationCampaignsRepository.updateStatus(id, schoolId, 'COMPLETED');
            analytics.campaign.status = 'COMPLETED';
            // Trigger global analysis if no decision exists
            if (!analytics.decision) {
                this.generatePostDeadlineAnalysis(id, 'SYSTEM', schoolId).catch(err => logger_1.logger.error('Auto-analysis failed', { error: err }));
            }
        }
        return analytics;
    },
    async sendReminders(id, schoolId) {
        const campaignRaw = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.findById(id, schoolId);
        if (!campaignRaw)
            throw new AppError_1.NotFoundError('EvaluationCampaign');
        const campaign = campaignRaw;
        let allStudentIds = [];
        if (campaign.scope === 'CLASS' && campaign.class?.users) {
            allStudentIds = campaign.class.users.map((u) => u.id);
        }
        else if (campaign.scope === 'CAMPUS') {
            allStudentIds = (campaign.campus?.users ?? []).filter(u => u.role === 'STUDENT').map((u) => u.id);
        }
        else if (campaign.scope === 'SCHOOL') {
            const users = await prisma_1.prisma.user.findMany({ where: { role: 'STUDENT', schoolId }, select: { id: true } });
            allStudentIds = users.map((u) => u.id);
        }
        const doneEvaluations = await prisma_1.prisma.evaluation.findMany({
            where: { campaignId: id, schoolId }, select: { evaluatorId: true },
        });
        const doneIds = new Set(doneEvaluations.map(e => e.evaluatorId).filter(Boolean));
        const missingIds = allStudentIds.filter(id => !doneIds.has(id));
        await notifications_service_1.notificationService.create({
            title: `Rappel: Évaluation requise pour ${campaign.title}`,
            message: campaign.module
                ? `N'oubliez pas de donner votre avis pour le module ${campaign.module.name}.`
                : `N'oubliez pas de donner votre avis concernant "${campaign.title}".`,
            type: 'EVALUATION_CAMPAIGN_REMINDER',
            targetUserIds: missingIds,
            campaignId: campaign.id,
            schoolId,
        }).catch((e) => logger_1.logger.error('Failed to send campaign reminders (bulk)', { error: e }));
    },
    async generatePostDeadlineAnalysis(id, userId, schoolId) {
        const analytics = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.getAnalytics(id, schoolId);
        if (!analytics)
            throw new AppError_1.NotFoundError('EvaluationCampaign');
        const { stats, campaign } = analytics;
        // 1. Check if a decision already exists
        const existing = await prisma_1.prisma.decision.findFirst({ where: { campaignId: id } });
        if (existing)
            return existing;
        // 2. Build context for AI
        const context = `
      Campagne: ${campaign.title}
      Périmètre: ${campaign.scope}
      ${campaign.module ? `Module: ${campaign.module.name}` : ''}
      ${campaign.professor ? `Professeur: ${campaign.professor.firstName} ${campaign.professor.lastName}` : ''}
      Stats: ${stats.totalDone}/${stats.totalExpected} participations (${stats.completionRate}%).
      Score Moyen Académique: ${stats.avgScore}/20.
      
      Liste des commentaires étudiants :
      ${campaign.evaluations.map((e) => `- [Note: ${e.score}/20] ${e.comment || 'Sans commentaire'}`).join('\n')}
    `;
        // 3. Call AI for Synthesis & Decision Suggestion
        // (In a real scenario, we'd use the job queue, but here we'll do it directly for the demo flow)
        const prompt = `Analyse les résultats de cette campagne d'évaluation et propose une décision administrative.
    Donne une réponse UNIQUEMENT en JSON strict.
    Format: {"summary":"Synthèse des points clés","recommendation":"Action suggérée (ex: Entretien de cadrage, Félicitations, Formation pédagogique)","priority":"HIGH|MEDIUM|LOW"}
    
    Données: ${context}`;
        const { aiBalancer } = await Promise.resolve().then(() => __importStar(require('../../core/ai/AiBalancer')));
        const aiRes = await aiBalancer.callAI(prompt, schoolId);
        let aiParsed;
        try {
            // Robust extraction as done in the processor
            const match = aiRes.content.match(/\{[\s\S]*\}/);
            aiParsed = JSON.parse(match ? match[0] : aiRes.content);
        }
        catch (e) {
            aiParsed = { summary: aiRes.content, recommendation: 'Analyse manuelle requise', priority: 'MEDIUM' };
        }
        // 4. Create the Decision
        const decision = await prisma_1.prisma.decision.create({
            data: {
                campaignId: id,
                deciderId: userId,
                schoolId,
                title: `Suivi suite à la campagne : ${campaign.title}`,
                rationale: aiParsed.summary,
                aiSuggestion: aiParsed.recommendation,
                status: 'PROPOSED',
                priority: aiParsed.priority === 'HIGH' ? 'HIGH' : (aiParsed.priority === 'LOW' ? 'LOW' : 'MEDIUM'),
            },
            include: { decider: { select: { firstName: true, lastName: true } } }
        });
        // 5. Notify admins that the AI report is ready
        notifications_service_1.notificationService.sendBroadcast(schoolId, {
            title: '🤖 Rapport IA généré — action requise',
            message: `L'analyse IA de la campagne "${campaign.title}" est prête. Une décision proposée a été générée automatiquement. Vérifiez et validez.`,
            targetRoles: ['ADMIN', 'MANAGER'],
            url: `/dashboard/decisions/${decision.id}`,
        }).catch(e => logger_1.logger.warn('[Notification] Analytics ready notify failed', { error: e }));
        return decision;
    }
};
//# sourceMappingURL=evaluation-campaigns.service.js.map