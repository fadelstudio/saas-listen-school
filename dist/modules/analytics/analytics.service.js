"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const prisma_1 = require("../../core/database/prisma");
const AppError_1 = require("../../core/errors/AppError");
function reportsInSchool(schoolId) {
    return {
        OR: [{ schoolId }, { class: { campus: { schoolId } } }],
    };
}
function evaluationsInSchool(schoolId) {
    return {
        OR: [{ schoolId }, { class: { campus: { schoolId } } }],
    };
}
exports.analyticsService = {
    async getDashboardStats(schoolId, campusId) {
        if (campusId) {
            const campus = await prisma_1.prisma.campus.findFirst({
                where: { id: campusId, schoolId },
            });
            if (!campus)
                throw new AppError_1.BadRequestError('Campus not found in this school');
        }
        const userWhere = campusId
            ? { schoolId, campuses: { some: { id: campusId } } }
            : { schoolId };
        const reportWhere = campusId
            ? { AND: [reportsInSchool(schoolId), { class: { campusId } }] }
            : reportsInSchool(schoolId);
        const evaluationWhere = campusId
            ? { AND: [evaluationsInSchool(schoolId), { class: { campusId } }] }
            : evaluationsInSchool(schoolId);
        const decisionWhere = campusId
            ? {
                OR: [
                    { evaluation: { AND: [evaluationsInSchool(schoolId), { class: { campusId } }] } },
                    { report: { AND: [reportsInSchool(schoolId), { class: { campusId } }] } },
                ],
            }
            : {
                OR: [{ evaluation: evaluationsInSchool(schoolId) }, { report: reportsInSchool(schoolId) }],
            };
        const [totalUsers, totalStudents, totalReports, totalEvaluations, avgScore, reportsByType, decisionsByStatus,] = await Promise.all([
            prisma_1.prisma.user.count({ where: userWhere }),
            prisma_1.prisma.user.count({ where: { ...userWhere, role: 'STUDENT' } }),
            prisma_1.prisma.report.count({ where: reportWhere }),
            prisma_1.prisma.evaluation.count({ where: evaluationWhere }),
            prisma_1.prisma.evaluation.aggregate({
                where: evaluationWhere,
                _avg: { score: true },
            }),
            prisma_1.prisma.report.groupBy({
                by: ['type'],
                where: reportWhere,
                _count: { id: true },
            }),
            prisma_1.prisma.decision.groupBy({
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
//# sourceMappingURL=analytics.service.js.map