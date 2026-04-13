import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import type { EvaluationCampaignFilters } from './evaluation-campaigns.types';

export const evaluationCampaignsRepository = {
  async findAll(filters: EvaluationCampaignFilters, pagination: { skip: number, limit: number }) {
    const where: Prisma.EvaluationCampaignWhereInput = {};

    if (filters.classId) where.classId = filters.classId;
    if (filters.campusId) where.campusId = filters.campusId;
    if (filters.scope) where.scope = filters.scope;
    if (filters.status) where.status = filters.status;

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
          _count: { select: { evaluations: true } }
        }
      }),
      prisma.evaluationCampaign.count({ where })
    ]);

    return { items, total };
  },

  async findById(id: string) {
    return prisma.evaluationCampaign.findUnique({
      where: { id },
      include: {
        class: {
          include: { users: { select: { id: true } } }
        },
        campus: {
          include: { users: { select: { id: true, role: true } } }
        },
        module: true,
        professor: true,
        evaluations: true
      }
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
        status: 'ACTIVE' // Start as active by default
      }
    });
  },

  async updateStatus(id: string, status: string) {
    return prisma.evaluationCampaign.update({
      where: { id },
      data: { status }
    });
  }
};
