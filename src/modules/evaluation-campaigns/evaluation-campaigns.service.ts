import { evaluationCampaignsRepository } from './evaluation-campaigns.repository';
import { notificationService } from '../notifications/notifications.service';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError, BadRequestError } from '../../core/errors/AppError';
import { logger } from '../../utils/logger';
import { prisma } from '../../core/database/prisma';
import type { CreateEvaluationCampaignInput } from './evaluation-campaigns.schema';
import type { EvaluationCampaignFilters } from './evaluation-campaigns.types';

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
  async create(data: CreateEvaluationCampaignInput, schoolId: string) {
    const module = await prisma.module.findFirst({
      where: { id: data.moduleId, schoolId },
    });
    if (!module) throw new BadRequestError('Module not found in this school');

    await assertProfessorInSchool(data.professorId, schoolId);

    if (data.scope === 'CLASS') {
      const cls = await prisma.class.findFirst({
        where: { id: data.classId!, campus: { schoolId } },
      });
      if (!cls) throw new BadRequestError('Class not found in this school');
    }

    if (data.scope === 'CAMPUS') {
      const campus = await prisma.campus.findFirst({
        where: { id: data.campusId!, schoolId },
      });
      if (!campus) throw new BadRequestError('Campus not found in this school');
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
        const users = await prisma.user.findMany({
          where: { role: 'STUDENT', schoolId },
          select: { id: true },
        });
        studentIds = users.map((u) => u.id);
      }

      await Promise.all(
        studentIds.map((userId: string) =>
          notificationService.create({
            title: `Nouvelle évaluation demandée: ${campaign.title}`,
            message: `Votre administration sollicite votre avis pour le module ${detailedCampaign.module.name}. Cliquez ici pour participer.`,
            type: 'EVALUATION_CAMPAIGN',
            userId,
            campaignId: campaign.id,
            schoolId,
          }),
        ),
      ).catch((e) => logger.error('Failed to send campaign notifications', { error: e }));
    }

    return campaign;
  },

  async getAll(schoolId: string, query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: EvaluationCampaignFilters = {
      classId:  typeof query.classId  === 'string' ? query.classId  : undefined,
      campusId: typeof query.campusId === 'string' ? query.campusId : undefined,
      scope:    typeof query.scope    === 'string' ? (query.scope as EvaluationCampaignFilters['scope']) : undefined,
      status:   typeof query.status   === 'string' ? query.status   : undefined,
    };

    const { items, total } = await evaluationCampaignsRepository.findAll(schoolId, filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string, schoolId: string) {
    const campaign = await evaluationCampaignsRepository.findById(id, schoolId);
    if (!campaign) throw new NotFoundError('EvaluationCampaign');
    return campaign;
  },

  async close(id: string, schoolId: string) {
    const updated = await evaluationCampaignsRepository.updateStatus(id, schoolId, 'COMPLETED');
    if (!updated) throw new NotFoundError('EvaluationCampaign');
    return updated;
  },
};
