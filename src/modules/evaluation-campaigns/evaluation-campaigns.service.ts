import { evaluationCampaignsRepository } from './evaluation-campaigns.repository';
import { notificationService } from '../notifications/notifications.service';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError } from '../../core/errors/AppError';
import { logger } from '../../utils/logger';
import type { CreateEvaluationCampaignInput } from './evaluation-campaigns.schema';
import type { EvaluationCampaignFilters } from './evaluation-campaigns.types';

export const evaluationCampaignsService = {
  async create(data: CreateEvaluationCampaignInput) {
    const campaign = await evaluationCampaignsRepository.create({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });

    // Create a global notification so ADMIN can see it too (useful for audit/testing)
    await notificationService.create({
      title: `Campagne créée: ${campaign.title}`,
      message: `Une nouvelle campagne d'évaluation a été créée.`,
      type: 'EVALUATION_CAMPAIGN',
    }).catch((e) => logger.error('Failed to create global campaign notification', { error: e }));
    
    // Now notify all students in the class
    const detailedCampaign = await evaluationCampaignsRepository.findById(campaign.id);
    if (detailedCampaign && detailedCampaign.class.users) {
      const studentIds = detailedCampaign.class.users.map((u: { id: string }) => u.id);
      
      // Batch send notifications
      await Promise.all(studentIds.map((userId: string) => 
        notificationService.create({
          title: `Nouvelle évaluation demandée: ${campaign.title}`,
          message: `Votre administration sollicite votre avis pour le module ${detailedCampaign.module.name}. Cliquez ici pour participer.`,
          type: 'EVALUATION_CAMPAIGN',
          userId
        })
      )).catch((e) => logger.error('Failed to send campaign notifications', { error: e }));
    }

    return campaign;
  },

  async getAll(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: EvaluationCampaignFilters = {
      classId: typeof query.classId === 'string' ? query.classId : undefined,
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
