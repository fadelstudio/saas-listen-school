import { prisma } from '../../core/database/prisma';
import { DecisionStatus, Priority, Prisma } from '@prisma/client';
import { CreateDecisionInput, UpdateDecisionInput, DecisionFilters } from './decisions.types';
import { parsePagination } from '../../utils/pagination';

type PaginationArgs = ReturnType<typeof parsePagination>;

export const decisionsRepository = {
  async create(data: CreateDecisionInput, deciderId: string, _schoolId?: string | null) {
    return prisma.decision.create({
      data: {
        evaluationId: data.evaluationId,
        reportId:     data.reportId,
        deciderId,
        title:        data.title,
        rationale:    data.rationale,
        priority:     data.priority    ?? Priority.MEDIUM,
        responsible:  data.responsible,
        dueDate:      data.dueDate ? new Date(data.dueDate) : null,
        status:       DecisionStatus.PENDING,
      },
      include: {
        decider:    { select: { id: true, firstName: true, lastName: true } },
        evaluation: { select: { id: true, score: true, status: true } },
        report:     { select: { id: true, title: true, type: true } },
      },
    });
  },

  async findById(id: string, schoolId?: string | null) {
    return prisma.decision.findFirst({
      where: {
        id,
        ...(schoolId
          ? {
              OR: [{ evaluation: { schoolId } }, { report: { schoolId } }],
            }
          : {}),
      },
      include: {
        decider:    { select: { id: true, firstName: true, lastName: true, email: true } },
        evaluation: true,
        report:     true,
        aiJobs:     { orderBy: { createdAt: 'desc' }, take: 3 },
      },
    });
  },

  async findAll(filters: DecisionFilters, pagination: PaginationArgs, schoolId?: string | null) {
    const where: Prisma.DecisionWhereInput = {
      ...(schoolId
        ? {
            OR: [{ evaluation: { schoolId } }, { report: { schoolId } }],
          }
        : {}),
      ...(filters.status    && { status: filters.status }),
      ...(filters.deciderId && { deciderId: filters.deciderId }),
      ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate   && { createdAt: { lte: new Date(filters.endDate) } }),
    };

    const [items, total] = await Promise.all([
      prisma.decision.findMany({
        where,
        skip:    pagination.skip,
        take:    pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        include: {
          decider: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.decision.count({ where }),
    ]);

    return { items, total };
  },

  async update(id: string, data: UpdateDecisionInput, schoolId?: string | null) {
    const decision = await prisma.decision.findFirst({
      where: {
        id,
        ...(schoolId ? { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } : {}),
      },
      select: { id: true },
    });
    if (!decision) return null;
    return prisma.decision.update({
      where: { id: decision.id },
      data: {
        ...(data.title       !== undefined && { title: data.title }),
        ...(data.rationale   !== undefined && { rationale: data.rationale }),
        ...(data.priority    !== undefined && { priority: data.priority }),
        ...(data.responsible !== undefined && { responsible: data.responsible }),
        ...(data.dueDate     !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      },
    });
  },

  async updateStatus(id: string, status: DecisionStatus, schoolId?: string | null) {
    const decision = await prisma.decision.findFirst({
      where: {
        id,
        ...(schoolId ? { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } : {}),
      },
      select: { id: true },
    });
    if (!decision) return null;
    return prisma.decision.update({ where: { id: decision.id }, data: { status } });
  },

  async delete(id: string, schoolId?: string | null) {
    return prisma.decision.deleteMany({
      where: {
        id,
        ...(schoolId ? { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } : {}),
      },
    });
  },

  async existsById(id: string, schoolId?: string | null): Promise<boolean> {
    return (
      (await prisma.decision.count({
        where: {
          id,
          ...(schoolId ? { OR: [{ evaluation: { schoolId } }, { report: { schoolId } }] } : {}),
        },
      })) > 0
    );
  },
};
