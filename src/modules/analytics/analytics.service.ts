import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { BadRequestError } from '../../core/errors/AppError';
import { GlobalAnalysisInput } from './analytics.schema';

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

  async generateGlobalAnalysis(input: GlobalAnalysisInput, userId: string, schoolId: string) {
    // 1. Gather Data based on filters
    const reportWhere: Prisma.ReportWhereInput = {
      schoolId,
      ...(input.campusId && { class: { campusId: input.campusId } }),
      ...(input.classId && { classId: input.classId }),
      ...(input.professorId && { professorId: input.professorId }),
      ...(input.moduleId && { moduleId: input.moduleId }),
      ...(input.startDate && { createdAt: { gte: new Date(input.startDate) } }),
      ...(input.endDate && { createdAt: { lte: new Date(input.endDate) } }),
    };

    const evaluationWhere: Prisma.EvaluationWhereInput = {
      schoolId,
      ...(input.campusId && { class: { campusId: input.campusId } }),
      ...(input.classId && { classId: input.classId }),
      ...(input.professorId && { professorId: input.professorId }),
      ...(input.moduleId && { moduleId: input.moduleId }),
      ...(input.startDate && { createdAt: { gte: new Date(input.startDate) } }),
      ...(input.endDate && { createdAt: { lte: new Date(input.endDate) } }),
    };

    const [reports, evaluations] = await Promise.all([
      input.includeReports ? prisma.report.findMany({ where: reportWhere, take: 50 }) : [],
      input.includeEvaluations ? prisma.evaluation.findMany({ where: evaluationWhere, take: 50 }) : [],
    ]);

    // 2. Prepare Context for AI
    const context = `
      Analyse Globale demandée : ${input.title}
      Filtres : ${JSON.stringify(input)}
      Signalements trouvés : ${reports.length}
      Évaluations trouvées : ${evaluations.length}
      
      Détails Signalements : ${reports.map(r => `[${r.type}] ${r.title}: ${r.content}`).join(' | ')}
      Détails Évaluations (Commentaires) : ${evaluations.map(e => `[Score: ${e.score}/20] ${e.comment}`).join(' | ')}
    `;

    // 3. Call AI
    const prompt = `Agis en tant qu'expert en gestion académique. Analyse ces données et fournis un rapport structuré.
    Réponds UNIQUEMENT en JSON strict.
    Format : {
      "summary": "Synthèse détaillée des points forts et faibles",
      "kpis": {"satisfaction": 0.8, "urgency": "LOW|MEDIUM|HIGH"},
      "proposedDecisions": [
        {"title": "...", "rationale": "...", "priority": "HIGH|MEDIUM|LOW"}
      ]
    }
    
    Données : ${context}`;

    const { aiBalancer } = await import('../../core/ai/AiBalancer');
    const aiRes = await aiBalancer.callAI(prompt, schoolId);
    
    let aiParsed;
    try {
      const match = aiRes.content.match(/\{[\s\S]*\}/);
      aiParsed = JSON.parse(match ? match[0] : aiRes.content);
    } catch (e) {
      aiParsed = { summary: aiRes.content, kpis: {}, proposedDecisions: [] };
    }

    // 4. Save Analysis Report
    const report = await prisma.analysisReport.create({
      data: {
        schoolId,
        title: input.title,
        content: aiParsed as any,
        filters: input as any,
        generatedById: userId,
      },
    });

    // 5. Proactively create Decisions if AI proposed any and urgency is high
    const createdDecisions = [];
    if (aiParsed.proposedDecisions && Array.isArray(aiParsed.proposedDecisions)) {
      for (const dec of aiParsed.proposedDecisions) {
        // Only auto-create if priority is HIGH or if the summary suggests critical issues
        if (dec.priority === 'HIGH' || aiParsed.kpis?.urgency === 'HIGH') {
          const d = await prisma.decision.create({
            data: {
              schoolId,
              analysisId: report.id,
              deciderId: userId,
              title: dec.title,
              rationale: dec.rationale,
              priority: dec.priority === 'HIGH' ? 'HIGH' : (dec.priority === 'LOW' ? 'LOW' : 'MEDIUM'),
              status: 'PROPOSED',
            } as any,
          });
          createdDecisions.push(d);
        }
      }
    }

    return {
      report,
      decisionsCreatedCount: createdDecisions.length,
      aiSummary: aiParsed.summary,
    };
  },
};

