import { evaluationCampaignsRepository } from './evaluation-campaigns.repository';
import { notificationService } from '../notifications/notifications.service';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError } from '../../core/errors/AppError';
import { logger } from '../../utils/logger';
import { prisma } from '../../core/database/prisma';
import type { CreateEvaluationCampaignInput } from './evaluation-campaigns.schema';
import type { EvaluationCampaignFilters } from './evaluation-campaigns.types';

export const evaluationCampaignsService = {
  async create(data: CreateEvaluationCampaignInput) {
    const campaign = await evaluationCampaignsRepository.create({
      ...data,
      dueDate: new Date(data.dueDate),
    });

    // Create a global notification so ADMIN can see it too (useful for audit/testing)
    await notificationService.create({
      title: `Campagne créée: ${campaign.title}`,
      message: `Une nouvelle campagne d'évaluation a été créée.`,
      type: 'EVALUATION_CAMPAIGN',
      campaignId: campaign.id,
    }).catch((e) => logger.error('Failed to create global campaign notification', { error: e }));
    
    // Now notify targeted students (class / campus / school)
    const detailedCampaignRaw = await evaluationCampaignsRepository.findById(campaign.id);
    const detailedCampaign = detailedCampaignRaw as unknown as {
      scope: 'CLASS' | 'CAMPUS' | 'SCHOOL';
      class?: { users: { id: string }[] } | null;
      campus?: { users: { id: string; role: string }[] } | null;
      module: { name: string };
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
        const users = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } });
        studentIds = users.map((u) => u.id);
      }
      
      // Batch send notifications
      await Promise.all(studentIds.map((userId: string) => 
        notificationService.create({
          title: `Nouvelle évaluation demandée: ${campaign.title}`,
          message: `Votre administration sollicite votre avis pour le module ${detailedCampaign.module.name}. Cliquez ici pour participer.`,
          type: 'EVALUATION_CAMPAIGN',
          userId,
          campaignId: campaign.id,
        })
      )).catch((e) => logger.error('Failed to send campaign notifications', { error: e }));
    }

    return campaign;
  },

  async getAll(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: EvaluationCampaignFilters = {
      classId: typeof query.classId === 'string' ? query.classId : undefined,
      campusId: typeof query.campusId === 'string' ? query.campusId : undefined,
      scope: typeof query.scope === 'string' ? (query.scope as EvaluationCampaignFilters['scope']) : undefined,
      status: typeof query.status === 'string' ? query.status : undefined,
    };
    
    const { items, total } = await evaluationCampaignsRepository.findAll(filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string) {
    const campaign = await evaluationCampaignsRepository.findById(id);
    if (!campaign) throw new NotFoundError('EvaluationCampaign');
    return campaign;
  },

  async close(id: string) {
    return evaluationCampaignsRepository.updateStatus(id, 'COMPLETED');
  }
};
