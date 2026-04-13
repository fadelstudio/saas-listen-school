"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationCampaignsService = void 0;
const evaluation_campaigns_repository_1 = require("./evaluation-campaigns.repository");
const notifications_service_1 = require("../notifications/notifications.service");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
const logger_1 = require("../../utils/logger");
const prisma_1 = require("../../core/database/prisma");
exports.evaluationCampaignsService = {
    async create(data) {
        const campaign = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.create({
            ...data,
            dueDate: new Date(data.dueDate),
        });
        // Create a global notification so ADMIN can see it too (useful for audit/testing)
        await notifications_service_1.notificationService.create({
            title: `Campagne créée: ${campaign.title}`,
            message: `Une nouvelle campagne d'évaluation a été créée.`,
            type: 'EVALUATION_CAMPAIGN',
            campaignId: campaign.id,
        }).catch((e) => logger_1.logger.error('Failed to create global campaign notification', { error: e }));
        // Now notify targeted students (class / campus / school)
        const detailedCampaignRaw = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.findById(campaign.id);
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
                const users = await prisma_1.prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } });
                studentIds = users.map((u) => u.id);
            }
            // Batch send notifications
            await Promise.all(studentIds.map((userId) => notifications_service_1.notificationService.create({
                title: `Nouvelle évaluation demandée: ${campaign.title}`,
                message: `Votre administration sollicite votre avis pour le module ${detailedCampaign.module.name}. Cliquez ici pour participer.`,
                type: 'EVALUATION_CAMPAIGN',
                userId,
                campaignId: campaign.id,
            }))).catch((e) => logger_1.logger.error('Failed to send campaign notifications', { error: e }));
        }
        return campaign;
    },
    async getAll(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            classId: typeof query.classId === 'string' ? query.classId : undefined,
            campusId: typeof query.campusId === 'string' ? query.campusId : undefined,
            scope: typeof query.scope === 'string' ? query.scope : undefined,
            status: typeof query.status === 'string' ? query.status : undefined,
        };
        const { items, total } = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.findAll(filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getById(id) {
        const campaign = await evaluation_campaigns_repository_1.evaluationCampaignsRepository.findById(id);
        if (!campaign)
            throw new AppError_1.NotFoundError('EvaluationCampaign');
        return campaign;
    },
    async close(id) {
        return evaluation_campaigns_repository_1.evaluationCampaignsRepository.updateStatus(id, 'COMPLETED');
    }
};
//# sourceMappingURL=evaluation-campaigns.service.js.map