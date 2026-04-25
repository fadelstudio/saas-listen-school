import { prisma } from '../../core/database/prisma';
import { Prisma } from '@prisma/client';
import { BadRequestError } from '../../core/errors/AppError';
import { GlobalAnalysisInput } from './analytics.schema';


export const analyticsService = {
  async getDashboardStats(schoolId: string, campusId?: string) {
    const userWhere: Prisma.UserWhereInput = { 
      schoolId, 
      ...(campusId && { campuses: { some: { id: campusId } } }) 
    };

    const reportWhere: Prisma.ReportWhereInput = { 
      schoolId,
      ...(campusId && { class: { campusId } })
    };

    const evaluationWhere: Prisma.EvaluationWhereInput = { 
      schoolId,
      ...(campusId && { class: { campusId } })
    };


    try {
      const [
        totalUsers,
        totalStudents,
        totalReports,
        totalEvaluations,
        avgScore,
        reportsByType,
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
      ]);

      // Use raw query for decisions to bypass Enum validation issues (like 'PENDING')
      const decisionsByStatusRaw = campusId 
        ? await prisma.$queryRaw<any[]>`
            SELECT status, CAST(COUNT(*) AS INTEGER) as count 
            FROM decisions 
            WHERE "schoolId" = ${schoolId} 
            AND (
              "evaluationId" IN (SELECT id FROM evaluations WHERE "classId" IN (SELECT id FROM classes WHERE "campusId" = ${campusId}))
              OR
              "reportId" IN (SELECT id FROM reports WHERE "classId" IN (SELECT id FROM classes WHERE "campusId" = ${campusId}))
            )
            GROUP BY status
          `
        : await prisma.$queryRaw<any[]>`
            SELECT status, CAST(COUNT(*) AS INTEGER) as count 
            FROM decisions 
            WHERE "schoolId" = ${schoolId}
            GROUP BY status
          `;

      return {
        counters: {
          users: totalUsers,
          students: totalStudents,
          reports: totalReports,
          evaluations: totalEvaluations,
          averageSatisfaction: Number((avgScore._avg.score || 0).toFixed(1)),
        },
        distributions: {
          reportsByType: reportsByType.map((r) => ({ type: r.type, count: r._count.id })),
          decisionsByStatus: decisionsByStatusRaw.map((d) => ({ status: d.status, count: d.count })),
        },
      };
    } catch (err) {
      console.error("❌ Analytics Dashboard Database Error:", err);
      throw err; // Re-throw to be caught by global handler but logged here
    }
  },

  async generateGlobalAnalysis(input: GlobalAnalysisInput, userId: string, schoolId: string) {
    // 1. Gather Data based on filters
    const reportWhere: Prisma.ReportWhereInput = {
      schoolId,
      ...(input.campusId && { campus: { id: input.campusId } }),
      ...(input.classId && { classId: input.classId }),
      ...(input.professorId && { professorId: input.professorId }),
      ...(input.moduleId && { moduleId: input.moduleId }),
      createdAt: {
        ...(input.startDate && { gte: new Date(input.startDate) }),
        ...(input.endDate && { lte: new Date(input.endDate) }),
      }
    };

    const evaluationWhere: Prisma.EvaluationWhereInput = {
      schoolId,
      ...(input.campusId && { class: { campusId: input.campusId } }),
      ...(input.classId && { classId: input.classId }),
      ...(input.professorId && { professorId: input.professorId }),
      ...(input.moduleId && { moduleId: input.moduleId }),
      createdAt: {
        ...(input.startDate && { gte: new Date(input.startDate) }),
        ...(input.endDate && { lte: new Date(input.endDate) }),
      }
    };

    const [reports, evaluations, decisions] = await Promise.all([
      input.includeReports ? prisma.report.findMany({ 
        where: reportWhere, 
        take: 100,
        include: { 
          class: { select: { name: true } }, 
          professor: { select: { firstName: true, lastName: true } },
          module: { select: { name: true } }
        }
      }) : [],
      input.includeEvaluations ? prisma.evaluation.findMany({ 
        where: evaluationWhere, 
        take: 100,
        include: { 
          class: { select: { name: true } }, 
          professor: { select: { firstName: true, lastName: true } },
          module: { select: { name: true } }
        }
      }) : [],
      // Use queryRaw to bypass Prisma's strict enum deserialization for legacy 'PENDING' values
      prisma.$queryRaw<any[]>`
        SELECT id, title, status, rationale 
        FROM decisions 
        WHERE "schoolId" = ${schoolId}
        AND "updatedAt" >= ${input.startDate ? new Date(input.startDate) : new Date(0)}
        AND "updatedAt" <= ${input.endDate ? new Date(input.endDate) : new Date()}
        LIMIT 50
      `
    ]);

    // 2. Prepare Context for AI
    const context = `
      Type d'Analyse : ${input.periodic ? 'RAPPORT DE PILOTAGE PÉRIODIQUE (ÉVOLUTION)' : 'AUDIT MANUEL'}
      Titre : ${input.title}
      Période : ${input.startDate || 'Début'} au ${input.endDate || 'Maintenant'}
      
      --- DONNÉES BRUTES ---
      Signalements (${reports.length}) : ${reports.map(r => `[${r.type}] ${r.title}: ${r.content}`).join(' | ')}
      Évaluations (${evaluations.length}) : ${evaluations.map(e => `[Score: ${e.score}/20] ${e.comment || 'Sans commentaire'}`).join(' | ')}
      
      --- HISTORIQUE DES DÉCISIONS SUR CETTE PÉRIODE ---
      DÉCISIONS : ${decisions.length > 0 ? decisions.map(d => `[Titre: ${d.title}] [Statut: ${d.status}] [Justification: ${d.rationale}]`).join(' | ') : 'Aucune décision préalable enregistrée sur cette période.'}
    `;

    // 3. Call AI
    const prompt = `Agis en tant qu'expert en pilotage stratégique académique. 
    Ton but est de produire un rapport d'évolution qui analyse l'impact des décisions passées et propose de nouvelles actions.

    CONSIGNES D'ANALYSE :
    1. SYNTHÈSE : Résume l'état actuel de façon narrative et professionnelle. Évite les formatages markdown excessifs (pas de listes à rallonge, reste synthétique). Si des décisions ont été APPROUVÉES, évalue si la situation s'améliore.
    2. ÉVOLUTION : Compare les nouveaux signalements avec les anciens.
    3. DÉCISIONS : Propose des actions CONCRÈTES. 
    
    Réponds UNIQUEMENT en JSON strict au format suivant :
    {
      "summary": "Analyse narrative détaillée focalisée sur l'évolution.",
      "kpis": {"satisfaction": 0.0 a 1.0, "urgency": "LOW|MEDIUM|HIGH"},
      "proposedDecisions": [
        {"title": "Court et percutant", "rationale": "Justification", "priority": "HIGH|MEDIUM|LOW"}
      ]
    }
    
    DONNÉES : ${context}`;

    const { aiBalancer } = await import('../../core/ai/AiBalancer');
    const aiRes = await aiBalancer.callAI(prompt, schoolId);
    
    let aiParsed;
    try {
      const match = aiRes.content.match(/\{[\s\S]*\}/);
      aiParsed = JSON.parse(match ? match[0] : aiRes.content);
    } catch (e) {
      aiParsed = { summary: aiRes.content, kpis: {}, proposedDecisions: [] };
    }

    // 0. Ensure schema is ready
    await this.ensureSchema();

    // 4. Save Analysis Report
    const report = await prisma.analysisReport.create({
      data: {
        schoolId,
        title: input.title,
        content: aiParsed as any,
        filters: { ...input, periodic: !!input.periodic } as any,
        generatedById: userId,
      },
    });

    // 5. Proactively create Decisions for ALL AI suggestions
    let decisionsCreatedCount = 0;
    if (aiParsed.proposedDecisions && Array.isArray(aiParsed.proposedDecisions)) {
      for (const dec of aiParsed.proposedDecisions) {
        if (!dec.title || typeof dec.title !== 'string') continue;

        try {
          const p = dec.priority === 'HIGH' ? 'HIGH' : (dec.priority === 'LOW' ? 'LOW' : 'MEDIUM');
          
          try {
            await prisma.decision.create({
              data: {
                schoolId,
                analysisId: report.id,
                deciderId: userId,
                title: dec.title.substring(0, 200),
                rationale: dec.rationale || "Suggéré par l'analyse IA globale",
                priority: p as any,
                status: 'PROPOSED' as any,
              }
            });
          } catch (enumErr) {
            // Fallback for older DB schemas without 'PROPOSED' status
            await prisma.decision.create({
              data: {
                schoolId,
                analysisId: report.id,
                deciderId: userId,
                title: dec.title.substring(0, 200),
                rationale: dec.rationale || "Suggéré par l'analyse IA globale",
                priority: p as any,
                status: 'PENDING' as any,
              }
            });
          }
          decisionsCreatedCount++;
        } catch (err) {
          console.error("❌ Failed to auto-create AI decision:", err);
        }
      }
    }

    return { 
      report, 
      decisionsCreatedCount,
      aiSummary: aiParsed.summary 
    };
  },

  async generatePeriodicReport(schoolId: string, userId: string) {
    const { env } = await import('../../core/config/env');
    const days = env.ANALYTICS_REPORT_INTERVAL_DAYS;
    
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); 
    startDate.setDate(startDate.getDate() - days);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const monthYear = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const formattedDate = monthYear.charAt(0).toUpperCase() + monthYear.slice(1).trim().replace(' ', '-');
    const title = `${formattedDate} Rapport de Pilotage Périodique (${days} jours)`;
    
    return this.generateGlobalAnalysis({
      title,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      includeReports: true,
      includeEvaluations: true,
      periodic: true 
    } as any, userId, schoolId);
  },

  async ensureSchema() {
    try {
      // 1. Check and heal analysis_reports table
      // We check if it exists first. If it exists but with legacy UUID id, we migrate.
      const tableCheck = await prisma.$queryRaw<any[]>`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'analysis_reports' AND column_name = 'id'
      `;

      if (tableCheck.length === 0) {
        // Create table
        await prisma.$executeRawUnsafe(`
          CREATE TABLE analysis_reports (
            id TEXT PRIMARY KEY,
            "schoolId" TEXT NOT NULL,
            title TEXT NOT NULL,
            content JSONB NOT NULL,
            filters JSONB NOT NULL,
            "isRead" BOOLEAN DEFAULT FALSE,
            "generatedById" TEXT NOT NULL,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } else if (tableCheck[0].data_type === 'uuid') {
        // Legacy migration
        await prisma.$executeRawUnsafe(`DROP TABLE analysis_reports CASCADE`);
        await this.ensureSchema(); // Recurse to create
        return;
      }

      // 2. Add analysisId to decisions if missing
      const columnCheck = await prisma.$queryRaw<any[]>`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'decisions' AND column_name = 'analysisId'
      `;

      if (columnCheck.length === 0) {
        await prisma.$executeRawUnsafe(`ALTER TABLE decisions ADD COLUMN "analysisId" TEXT`);
      }

      // 3. Add isRead to analysis_reports if missing
      const readCheck = await prisma.$queryRaw<any[]>`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'analysis_reports' AND column_name = 'isRead'
      `;
      if (readCheck.length === 0) {
        await prisma.$executeRawUnsafe(`ALTER TABLE analysis_reports ADD COLUMN "isRead" BOOLEAN DEFAULT FALSE`);
      }
    } catch (err) {
      console.warn("⚠️ Database self-healing check failed:", err);
    }
  },

  async getReports(schoolId: string, filters?: { limit?: number; page?: number; periodic?: boolean; q?: string }) {
    await this.ensureSchema();
    const limit = filters?.limit || 10;
    const page = filters?.page || 1;
    const skip = (page - 1) * limit;

    // Use queryRaw to ensure we get the 'isRead' column from the DB
    // since the Prisma Client might not be regenerated yet.
    const periodicFilter = filters?.periodic !== undefined ? (filters.periodic ? 'TRUE' : 'FALSE') : null;
    const searchFilter = filters?.q ? `%${filters.q}%` : null;

    const items = await prisma.$queryRaw<any[]>`
      SELECT 
        r.*,
        json_build_object('firstName', u."firstName", 'lastName', u."lastName", 'avatarPath', u."avatarPath") as "generatedBy"
      FROM analysis_reports r
      LEFT JOIN users u ON r."generatedById" = u.id
      WHERE r."schoolId" = ${schoolId}
      ${periodicFilter !== null ? (periodicFilter === 'TRUE' ? Prisma.sql`AND (r.filters->>'periodic')::boolean = TRUE` : Prisma.sql`AND (r.filters->>'periodic')::boolean IS NOT TRUE`) : Prisma.empty}
      ${searchFilter ? Prisma.sql`AND r.title ILIKE ${searchFilter}` : Prisma.empty}
      ORDER BY r."createdAt" DESC
      LIMIT ${limit}
      OFFSET ${skip}
    `;

    const totalRes = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as count FROM analysis_reports r
      WHERE r."schoolId" = ${schoolId}
      ${periodicFilter !== null ? (periodicFilter === 'TRUE' ? Prisma.sql`AND (r.filters->>'periodic')::boolean = TRUE` : Prisma.sql`AND (r.filters->>'periodic')::boolean IS NOT TRUE`) : Prisma.empty}
      ${searchFilter ? Prisma.sql`AND r.title ILIKE ${searchFilter}` : Prisma.empty}
    `;
    const total = totalRes[0]?.count || 0;

    return {
      items: items.map(i => ({
        ...i,
        isRead: !!i.isRead // Ensure boolean
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  async getReportById(id: string, schoolId: string) {
    await this.ensureSchema();
    const report = await prisma.analysisReport.findFirst({
      where: { id, schoolId },
      include: {
        generatedBy: { select: { firstName: true, lastName: true, avatarPath: true } }
      }
    });

    if (report && !(report as any).isRead) {
      await prisma.$executeRawUnsafe(`UPDATE analysis_reports SET "isRead" = TRUE WHERE id = '${id}'`);
    }

    if (!report) throw new BadRequestError('Analysis report not found');

    // Fetch decisions manually using raw SQL to completely bypass Prisma Enum errors
    let decisions: any[] = [];
    try {
      decisions = await prisma.$queryRaw`SELECT * FROM "decisions" WHERE "analysisId" = ${id} AND "schoolId" = ${schoolId} ORDER BY "createdAt" ASC`;
    } catch (err) {
      console.warn("Could not fetch decisions raw:", err);
    }

    return {
      ...(report as any),
      decisions
    };
  }
};
