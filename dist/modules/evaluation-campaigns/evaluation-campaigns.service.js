"use strict";
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
        const module = await prisma_1.prisma.module.findFirst({
            where: { id: data.moduleId, schoolId },
        });
        if (!module)
            throw new AppError_1.BadRequestError('Module not found in this school');
        await assertProfessorInSchool(data.professorId, schoolId);
        if (data.scope === 'CLASS') {
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
            await Promise.all(studentIds.map((userId) => notifications_service_1.notificationService.create({
                title: `Nouvelle évaluation demandée: ${campaign.title}`,
                message: `Votre administration sollicite votre avis pour le module ${detailedCampaign.module.name}. Cliquez ici pour participer.`,
                type: 'EVALUATION_CAMPAIGN',
                userId,
                campaignId: campaign.id,
                schoolId,
            }))).catch((e) => logger_1.logger.error('Failed to send campaign notifications', { error: e }));
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
        const updated = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.updateStatus(id, schoolId, 'COMPLETED');
        if (!updated)
            throw new AppError_1.NotFoundError('EvaluationCampaign');
        return updated;
    },
};
//# sourceMappingURL=evaluation-campaigns.service.js.map