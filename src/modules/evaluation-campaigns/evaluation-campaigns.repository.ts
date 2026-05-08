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
        ...(filters.campusId 
          ? [{
              OR: [
                { campusId: filters.campusId },
                { class: { campusId: filters.campusId } }
              ]
            }]
          : []
        ),
        ...(filters.campusIds && filters.campusIds.length > 0 
          ? [{
              OR: [
                { campusId: { in: filters.campusIds } },
                { class: { campusId: { in: filters.campusIds } } }
              ]
            }]
          : []
        ),
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
    moduleId?: string;
    professorId?: string;
    dueDate: Date;
  }) {
    return prisma.evaluationCampaign.create({
      data: {
        title: data.title,
        description: data.description || undefined,
        scope: data.scope,
        classId: data.classId || undefined,
        campusId: data.campusId || undefined,
        moduleId: data.moduleId || undefined,
        professorId: data.professorId || undefined,
        dueDate: data.dueDate,
        status: 'ACTIVE',
      } as any,
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

  async getAnalytics(id: string, schoolId: string) {
    const campaign = await prisma.evaluationCampaign.findFirst({
      where: { id, ...campaignInSchool(schoolId) },
      include: {
        class: { include: { users: { where: { role: 'STUDENT' }, select: { id: true } } } },
        campus: { include: { users: { where: { role: 'STUDENT' }, select: { id: true } } } },
        _count: { select: { evaluations: true } },
        evaluations: {
          select: { id: true, score: true, aiScore: true, comment: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        module: true,
        professor: true,
      },
    });

    if (!campaign) return null;

    let totalExpected = 0;
    if (campaign.scope === 'CLASS') {
      totalExpected = campaign.class?.users.length || 0;
    } else if (campaign.scope === 'CAMPUS') {
      totalExpected = campaign.campus?.users.length || 0;
    } else if (campaign.scope === 'SCHOOL') {
      totalExpected = await prisma.user.count({ where: { role: 'STUDENT', schoolId } });
    }

    const totalDone = campaign._count.evaluations;
    const completionRate = totalExpected > 0 ? (totalDone / totalExpected) * 100 : 0;
    
    const avgScore = campaign.evaluations.reduce((acc, curr) => acc + (curr.score || 0), 0) / (totalDone || 1);
    const avgAiScore = campaign.evaluations.reduce((acc, curr) => acc + (curr.aiScore || 0), 0) / (totalDone || 1);

    // Get the decision if it exists
    const decision = await prisma.decision.findFirst({
      where: { campaignId: id } as any,
      include: { decider: { select: { firstName: true, lastName: true } } },
    });

    return {
      campaign,
      stats: {
        totalExpected,
        totalDone,
        completionRate: Number(completionRate.toFixed(1)),
        avgScore: Number(avgScore.toFixed(1)),
        avgAiScore: Number(avgAiScore.toFixed(1)),
      },
      decision,
    };
  },
  async findAllForStudent(
    schoolId: string,
    filters: { classId?: string; campusIds?: string[]; status?: string },
    pagination: { skip: number; limit: number },
    userId?: string,
  ) {
    const tenant = campaignInSchool(schoolId);
    
    const where: Prisma.EvaluationCampaignWhereInput = {
      AND: [
        tenant,
        {
          OR: [
            { scope: 'SCHOOL' },
            ...(filters.campusIds && filters.campusIds.length > 0
              ? [{ AND: [{ scope: 'CAMPUS' }, { campusId: { in: filters.campusIds } }] }]
              : []),
            ...(filters.classId ? [{ AND: [{ scope: 'CLASS' }, { classId: filters.classId }] }] : []),
          ],
        },
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
          ...(userId ? { evaluations: { where: { evaluatorId: userId }, select: { id: true } } } : {}),
        },
      }),
      prisma.evaluationCampaign.count({ where }),
    ]);

    const itemsWithStatus = items.map(item => {
      const { evaluations, ...rest } = item as any;
      return {
        ...rest,
        hasEvaluated: evaluations ? evaluations.length > 0 : false,
      };
    });

    return { items: itemsWithStatus, total };
  },

};

