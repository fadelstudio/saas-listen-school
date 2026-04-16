"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.analyticsService = {
    async getDashboardStats(campusId) {
        const where = campusId ? { campusId } : {};
        const [totalUsers, totalStudents, totalReports, totalEvaluations, avgScore, reportsByType, decisionsByStatus] = await Promise.all([
            prisma_1.prisma.user.count({ where }),
            prisma_1.prisma.user.count({ where: { ...where, role: 'STUDENT' } }),
            prisma_1.prisma.report.count({ where: campusId ? { class: { campusId } } : {} }),
            prisma_1.prisma.evaluation.count({ where: campusId ? { class: { campusId } } : {} }),
            prisma_1.prisma.evaluation.aggregate({
                where: campusId ? { class: { campusId } } : {},
                _avg: { score: true }
            }),
            prisma_1.prisma.report.groupBy({
                by: ['type'],
                where: campusId ? { class: { campusId } } : {},
                _count: { id: true }
            }),
            prisma_1.prisma.decision.groupBy({
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
//# sourceMappingURL=analytics.service.js.map