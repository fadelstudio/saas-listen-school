import { evaluationCampaignsRepository } from './evaluation-campaigns.repository';
import { notificationService } from '../notifications/notifications.service';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError } from '../../core/errors/AppError';

export const evaluationCampaignsService = {
  async create(data: any) {
    const campaign = await evaluationCampaignsRepository.create(data);
    
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
      )).catch(e => console.error('Failed to send campaign notifications:', e));
    }

    return campaign;
  },

  async getAll(query: Record<string, any>) {
    const pagination = parsePagination(query);
    const filters = {
      classId: query.classId,
      status: query.status
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
