import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { BadRequestError } from '../../core/errors/AppError';

function reportsInSchool(schoolId: string): Prisma.ReportWhereInput {
  return {
    OR: [{ schoolId }, { class: { campus: { schoolId } } }],
  };
}

function evaluationsInSchool(schoolId: string): Prisma.EvaluationWhereInput {
  return {
    OR: [{ schoolId }, { class: { campus: { schoolId } } }],
  };
}

export const analyticsService = {
  async getDashboardStats(schoolId: string, campusId?: string) {
    if (campusId) {
      const campus = await prisma.campus.findFirst({
        where: { id: campusId, schoolId },
      });
      if (!campus) throw new BadRequestError('Campus not found in this school');
    }

    const userWhere: Prisma.UserWhereInput = campusId 
      ? { schoolId, campuses: { some: { id: campusId } } } 
      : { schoolId };

    const reportWhere: Prisma.ReportWhereInput = campusId
      ? { AND: [reportsInSchool(schoolId), { class: { campusId } }] }
      : reportsInSchool(schoolId);

    const evaluationWhere: Prisma.EvaluationWhereInput = campusId
      ? { AND: [evaluationsInSchool(schoolId), { class: { campusId } }] }
      : evaluationsInSchool(schoolId);

    const decisionWhere: Prisma.DecisionWhereInput = campusId
      ? {
          OR: [
            { evaluation: { AND: [evaluationsInSchool(schoolId), { class: { campusId } }] } },
            { report: { AND: [reportsInSchool(schoolId), { class: { campusId } }] } },
          ],
        }
      : {
          OR: [{ evaluation: evaluationsInSchool(schoolId) }, { report: reportsInSchool(schoolId) }],
        };

    const [
      totalUsers,
      totalStudents,
      totalReports,
      totalEvaluations,
      avgScore,
      reportsByType,
      decisionsByStatus,
    ] = await Promise.all([
      prisma.user.count({ where: userWhere }),
      prisma.user.count({ where: { ...userWhere, role: 'STUDENT' } }),
      prisma.report.count({ where: reportWhere }),
      prisma.evaluation.count({ where: evaluationWhere }),
      prisma.evaluation.aggregate({
        where: evaluationWhere,
        _avg: { score: true },
      }),
      prisma.report.groupBy({
        by: ['type'],
        where: reportWhere,
        _count: { id: true },
      }),
      prisma.decision.groupBy({
        by: ['status'],
        where: decisionWhere,
        _count: { id: true },
      }),
    ]);

    return {
      counters: {
        users: totalUsers,
        students: totalStudents,
        reports: totalReports,
        evaluations: totalEvaluations,
        averageSatisfaction: avgScore._avg.score || 0,
      },
      distributions: {
        reportsByType: reportsByType.map((r) => ({ type: r.type, count: r._count.id })),
        decisionsByStatus: decisionsByStatus.map((d) => ({ status: d.status, count: d._count.id })),
      },
    };
  },
};
