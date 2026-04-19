import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import type { EvaluationCampaignFilters } from './evaluation-campaigns.types';

/** Campagne rattachée au tenant : par classe, campus, ou portée école avec prof du campus. */
export function campaignInSchool(schoolId: string): Prisma.EvaluationCampaignWhereInput {
  return {
    OR: [
      {
        AND: [
          { scope: 'CLASS' },
          { class: { campus: { schoolId } } },
        ],
      },
      {
        AND: [
          { scope: 'CAMPUS' },
          { campus: { schoolId } },
        ],
      },
      {
        AND: [
          { scope: 'SCHOOL' },
          { module: { schoolId } },
        ],
      },
    ],
  };
}

export const evaluationCampaignsRepository = {
  async findAll(
    schoolId: string,
    filters: EvaluationCampaignFilters,
    pagination: { skip: number; limit: number },
  ) {
    const tenant = campaignInSchool(schoolId);
    const where: Prisma.EvaluationCampaignWhereInput = {
      AND: [
        tenant,
        ...(filters.classId ? [{ classId: filters.classId }] : []),
        ...(filters.campusId ? [{ campusId: filters.campusId }] : []),
        ...(filters.scope ? [{ scope: filters.scope }] : []),
        ...(filters.status ? [{ status: filters.status }] : []),
      ],
    };

    const [items, total] = await Promise.all([
      prisma.evaluationCampaign.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          class: true,
          module: true,
          professor: true,
          _count: { select: { evaluations: true } },
        },
      }),
      prisma.evaluationCampaign.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string, schoolId: string) {
    return prisma.evaluationCampaign.findFirst({
      where: { id, ...campaignInSchool(schoolId) },
      include: {
        class: {
          include: { users: { select: { id: true } } },
        },
        campus: {
          include: { users: { select: { id: true, role: true } } },
        },
        module: true,
        professor: true,
        evaluations: true,
      },
    });
  },

  async create(data: {
    title: string;
    description?: string;
    scope: string;
    classId?: string;
    campusId?: string;
    moduleId: string;
    professorId: string;
    dueDate: Date;
  }) {
    return prisma.evaluationCampaign.create({
      data: {
        title: data.title,
        description: data.description,
        scope: data.scope,
        classId: data.classId,
        campusId: data.campusId,
        moduleId: data.moduleId,
        professorId: data.professorId,
        dueDate: data.dueDate,
        status: 'ACTIVE',
      },
    });
  },

  async updateStatus(id: string, schoolId: string, status: string) {
    const row = await prisma.evaluationCampaign.findFirst({
      where: { id, ...campaignInSchool(schoolId) },
    });
    if (!row) return null;
    return prisma.evaluationCampaign.update({
      where: { id },
      data: { status },
    });
  },
};
