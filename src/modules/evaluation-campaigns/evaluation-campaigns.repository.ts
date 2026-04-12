import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';

export const evaluationCampaignsRepository = {
  async findAll(filters: any, pagination: { skip: number, limit: number }) {
    const where: Prisma.EvaluationCampaignWhereInput = {};

    if (filters.classId) where.classId = filters.classId;
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
        module: true,
        professor: true,
        evaluations: true
      }
    });
  },

  async create(data: {
    title: string;
    description?: string;
    classId: string;
    moduleId: string;
    professorId: string;
    dueDate?: Date;
  }) {
    return prisma.evaluationCampaign.create({
      data: {
        title: data.title,
        description: data.description,
        classId: data.classId,
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
