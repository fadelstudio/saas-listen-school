import { prisma } from '../../core/database/prisma';

export const analyticsService = {
  async getDashboardStats(campusId?: string) {
    const where: any = campusId ? { campusId } : {};

    const [
      totalUsers,
      totalStudents,
      totalReports,
      totalEvaluations,
      avgScore,
      reportsByType,
      decisionsByStatus
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, role: 'STUDENT' } }),
      prisma.report.count({ where: campusId ? { class: { campusId } } : {} }),
      prisma.evaluation.count({ where: campusId ? { class: { campusId } } : {} }),
      prisma.evaluation.aggregate({
        where: campusId ? { class: { campusId } } : {},
        _avg: { score: true }
      }),
      prisma.report.groupBy({
        by: ['type'],
        where: campusId ? { class: { campusId } } : {},
        _count: { id: true }
      }),
      prisma.decision.groupBy({
        by: ['status'],
        where: campusId ? { evaluation: { class: { campusId } } } : {},
        _count: { id: true }
      })
    ]);

    return {
      counters: {
        users: totalUsers,
        students: totalStudents,
        reports: totalReports,
        evaluations: totalEvaluations,
        averageSatisfaction: avgScore._avg.score || 0
      },
      distributions: {
        reportsByType: reportsByType.map(r => ({ type: r.type, count: r._count.id })),
        decisionsByStatus: decisionsByStatus.map(d => ({ status: d.status, count: d._count.id }))
      }
    };
  }
};
