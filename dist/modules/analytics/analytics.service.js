"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
const AppError_1 = require("../../core/errors/AppError");
exports.analyticsService = {
    async getDashboardStats(schoolId, campusId) {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(now.getDate() - 60);
        const userWhere = {
            schoolId,
            ...(campusId && { campuses: { some: { id: campusId } } })
        };
        const reportWhere = {
            schoolId,
            ...(campusId && { class: { campusId } })
        };
        const evaluationWhere = {
            schoolId,
            ...(campusId && { class: { campusId } })
        };
        try {
            const [totalUsers, totalStudents, totalReports, totalEvaluations, avgScore, reportsByType, 
            // For Trends
            prevReports, prevEvaluations] = await Promise.all([
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
                // Counts for previous 30-day window
                prisma_1.prisma.report.count({
                    where: {
                        ...reportWhere,
                        createdAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo }
                    }
                }),
                prisma_1.prisma.evaluation.count({
                    where: {
                        ...evaluationWhere,
                        createdAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo }
                    }
                }),
                prisma_1.prisma.user.count({
                    where: {
                        ...userWhere,
                        role: 'STUDENT',
                        createdAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo }
                    }
                }),
                prisma_1.prisma.user.count({
                    where: {
                        ...userWhere,
                        createdAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo }
                    }
                })
            ]);
            // Calculate simple trends
            const calculateTrend = (current, previous) => {
                if (previous <= 0)
                    return 0; // Avoid showing +100% on new installs
                return Number((((current - previous) / previous) * 100).toFixed(1));
            };
            // Current 30-day counts for precise trend
            const [currentReports, currentEvaluations, currentStudents, currentUsers] = await Promise.all([
                prisma_1.prisma.report.count({ where: { ...reportWhere, createdAt: { gte: thirtyDaysAgo } } }),
                prisma_1.prisma.evaluation.count({ where: { ...evaluationWhere, createdAt: { gte: thirtyDaysAgo } } }),
                prisma_1.prisma.user.count({ where: { ...userWhere, role: 'STUDENT', createdAt: { gte: thirtyDaysAgo } } }),
                prisma_1.prisma.user.count({ where: { ...userWhere, createdAt: { gte: thirtyDaysAgo } } })
            ]);
            // Use raw query for decisions to bypass Enum validation issues
            const decisionsByStatusRaw = campusId
                ? await prisma_1.prisma.$queryRaw `
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
                : await prisma_1.prisma.$queryRaw `
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
                trends: {
                    reports: calculateTrend(currentReports, prevReports),
                    evaluations: calculateTrend(currentEvaluations, prevEvaluations),
                    students: calculateTrend(currentStudents, Number(totalStudents) - currentStudents), // Approximation
                    users: calculateTrend(currentUsers, Number(totalUsers) - currentUsers),
                    satisfaction: 5.2 // Mock constant for now
                },
                distributions: {
                    reportsByType: reportsByType.map((r) => ({ type: r.type, count: r._count.id })),
                    decisionsByStatus: decisionsByStatusRaw.map((d) => ({ status: d.status, count: d.count })),
                },
            };
        }
        catch (err) {
            console.error("❌ Analytics Dashboard Database Error:", err);
            throw err; // Re-throw to be caught by global handler but logged here
        }
    },
    async getTimeSeriesStats(schoolId, period = 'week', campusId) {
        const now = new Date();
        let startDate = new Date();
        if (period === 'day')
            startDate.setHours(0, 0, 0, 0);
        else if (period === 'week')
            startDate.setDate(now.getDate() - 7);
        else if (period === 'month')
            startDate.setMonth(now.getMonth() - 1);
        else if (period === 'year')
            startDate.setFullYear(now.getFullYear() - 1);
        // Grouping interval for SQL
        let interval = 'day';
        if (period === 'year')
            interval = 'month';
        const stats = await prisma_1.prisma.$queryRaw `
      WITH date_series AS (
        SELECT generate_series(
          DATE_TRUNC(${interval}, ${startDate}::timestamp),
          DATE_TRUNC(${interval}, ${now}::timestamp),
          ${`1 ${interval}`}::interval
        ) as date
      )
      SELECT 
        ds.date,
        COALESCE(SUM(CASE WHEN r.status = 'SUBMITTED' THEN 1 ELSE 0 END), 0) as submitted,
        COALESCE(SUM(CASE WHEN r.status = 'REVIEWED' THEN 1 ELSE 0 END), 0) as in_progress,
        COALESCE(SUM(CASE WHEN r.status = 'APPROVED' THEN 1 ELSE 0 END), 0) as resolved
      FROM date_series ds
      LEFT JOIN reports r ON DATE_TRUNC(${interval}, r."createdAt") = ds.date 
        AND r."schoolId" = ${schoolId}
        ${campusId ? client_1.Prisma.sql `AND r."classId" IN (SELECT id FROM classes WHERE "campusId" = ${campusId})` : client_1.Prisma.empty}
      GROUP BY ds.date
      ORDER BY ds.date ASC
    `;
        return stats.map(s => ({
            date: s.date,
            submitted: Number(s.submitted),
            inProgress: Number(s.in_progress),
            resolved: Number(s.resolved)
        }));
    },
    async generateGlobalAnalysis(input, userId, schoolId) {
        // 1. Gather Data based on filters
        const reportWhere = {
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
        const evaluationWhere = {
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
            input.includeReports ? prisma_1.prisma.report.findMany({
                where: reportWhere,
                take: 100,
                include: {
                    class: { select: { name: true } },
                    professor: { select: { firstName: true, lastName: true } },
                    module: { select: { name: true } }
                }
            }) : [],
            input.includeEvaluations ? prisma_1.prisma.evaluation.findMany({
                where: evaluationWhere,
                take: 100,
                include: {
                    class: { select: { name: true } },
                    professor: { select: { firstName: true, lastName: true } },
                    module: { select: { name: true } }
                }
            }) : [],
            // Use queryRaw to bypass Prisma's strict enum deserialization for legacy 'PENDING' values
            prisma_1.prisma.$queryRaw `
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
        const { aiBalancer } = await Promise.resolve().then(() => __importStar(require('../../core/ai/AiBalancer')));
        const aiRes = await aiBalancer.callAI(prompt, schoolId);
        let aiParsed;
        try {
            const match = aiRes.content.match(/\{[\s\S]*\}/);
            aiParsed = JSON.parse(match ? match[0] : aiRes.content);
        }
        catch (e) {
            aiParsed = { summary: aiRes.content, kpis: {}, proposedDecisions: [] };
        }
        // 0. Ensure schema is ready
        await this.ensureSchema();
        // 4. Save Analysis Report
        const report = await prisma_1.prisma.analysisReport.create({
            data: {
                schoolId,
                title: input.title,
                content: aiParsed,
                filters: { ...input, periodic: !!input.periodic },
                generatedById: userId,
            },
        });
        // 5. Proactively create Decisions for ALL AI suggestions
        let decisionsCreatedCount = 0;
        if (aiParsed.proposedDecisions && Array.isArray(aiParsed.proposedDecisions)) {
            for (const dec of aiParsed.proposedDecisions) {
                if (!dec.title || typeof dec.title !== 'string')
                    continue;
                try {
                    const p = dec.priority === 'HIGH' ? 'HIGH' : (dec.priority === 'LOW' ? 'LOW' : 'MEDIUM');
                    try {
                        await prisma_1.prisma.decision.create({
                            data: {
                                schoolId,
                                analysisId: report.id,
                                deciderId: userId,
                                title: dec.title.substring(0, 200),
                                rationale: dec.rationale || "Suggéré par l'analyse IA globale",
                                priority: p,
                                status: 'PROPOSED',
                            }
                        });
                    }
                    catch (enumErr) {
                        // Fallback for older DB schemas without 'PROPOSED' status
                        await prisma_1.prisma.decision.create({
                            data: {
                                schoolId,
                                analysisId: report.id,
                                deciderId: userId,
                                title: dec.title.substring(0, 200),
                                rationale: dec.rationale || "Suggéré par l'analyse IA globale",
                                priority: p,
                                status: 'PENDING',
                            }
                        });
                    }
                    decisionsCreatedCount++;
                }
                catch (err) {
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
    async generatePeriodicReport(schoolId, userId) {
        const { env } = await Promise.resolve().then(() => __importStar(require('../../core/config/env')));
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
        }, userId, schoolId);
    },
    async ensureSchema() {
        try {
            // 1. Check and heal analysis_reports table
            // We check if it exists first. If it exists but with legacy UUID id, we migrate.
            const tableCheck = await prisma_1.prisma.$queryRaw `
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'analysis_reports' AND column_name = 'id'
      `;
            if (tableCheck.length === 0) {
                // Create table
                await prisma_1.prisma.$executeRawUnsafe(`
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
            }
            else if (tableCheck[0].data_type === 'uuid') {
                // Legacy migration
                await prisma_1.prisma.$executeRawUnsafe(`DROP TABLE analysis_reports CASCADE`);
                await this.ensureSchema(); // Recurse to create
                return;
            }
            // 2. Add analysisId to decisions if missing
            const columnCheck = await prisma_1.prisma.$queryRaw `
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'decisions' AND column_name = 'analysisId'
      `;
            if (columnCheck.length === 0) {
                await prisma_1.prisma.$executeRawUnsafe(`ALTER TABLE decisions ADD COLUMN "analysisId" TEXT`);
            }
            // 3. Add isRead to analysis_reports if missing
            const readCheck = await prisma_1.prisma.$queryRaw `
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'analysis_reports' AND column_name = 'isRead'
      `;
            if (readCheck.length === 0) {
                await prisma_1.prisma.$executeRawUnsafe(`ALTER TABLE analysis_reports ADD COLUMN "isRead" BOOLEAN DEFAULT FALSE`);
            }
        }
        catch (err) {
            console.warn("⚠️ Database self-healing check failed:", err);
        }
    },
    async getReports(schoolId, filters) {
        await this.ensureSchema();
        const limit = filters?.limit || 10;
        const page = filters?.page || 1;
        const skip = (page - 1) * limit;
        // Use queryRaw to ensure we get the 'isRead' column from the DB
        // since the Prisma Client might not be regenerated yet.
        const periodicFilter = filters?.periodic !== undefined ? (filters.periodic ? 'TRUE' : 'FALSE') : null;
        const searchFilter = filters?.q ? `%${filters.q}%` : null;
        const items = await prisma_1.prisma.$queryRaw `
      SELECT 
        r.*,
        json_build_object('firstName', u."firstName", 'lastName', u."lastName", 'avatarPath', u."avatarPath") as "generatedBy"
      FROM analysis_reports r
      LEFT JOIN users u ON r."generatedById" = u.id
      WHERE r."schoolId" = ${schoolId}
      ${periodicFilter !== null ? (periodicFilter === 'TRUE' ? client_1.Prisma.sql `AND (r.filters->>'periodic')::boolean = TRUE` : client_1.Prisma.sql `AND (r.filters->>'periodic')::boolean IS NOT TRUE`) : client_1.Prisma.empty}
      ${searchFilter ? client_1.Prisma.sql `AND r.title ILIKE ${searchFilter}` : client_1.Prisma.empty}
      ORDER BY r."createdAt" DESC
      LIMIT ${limit}
      OFFSET ${skip}
    `;
        const totalRes = await prisma_1.prisma.$queryRaw `
      SELECT COUNT(*)::int as count FROM analysis_reports r
      WHERE r."schoolId" = ${schoolId}
      ${periodicFilter !== null ? (periodicFilter === 'TRUE' ? client_1.Prisma.sql `AND (r.filters->>'periodic')::boolean = TRUE` : client_1.Prisma.sql `AND (r.filters->>'periodic')::boolean IS NOT TRUE`) : client_1.Prisma.empty}
      ${searchFilter ? client_1.Prisma.sql `AND r.title ILIKE ${searchFilter}` : client_1.Prisma.empty}
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
    async getReportById(id, schoolId) {
        await this.ensureSchema();
        const report = await prisma_1.prisma.analysisReport.findFirst({
            where: { id, schoolId },
            include: {
                generatedBy: { select: { firstName: true, lastName: true, avatarPath: true } }
            }
        });
        if (report && !report.isRead) {
            await prisma_1.prisma.$executeRawUnsafe(`UPDATE analysis_reports SET "isRead" = TRUE WHERE id = '${id}'`);
        }
        if (!report)
            throw new AppError_1.BadRequestError('Analysis report not found');
        // Fetch decisions manually using raw SQL to completely bypass Prisma Enum errors
        let decisions = [];
        try {
            decisions = await prisma_1.prisma.$queryRaw `SELECT * FROM "decisions" WHERE "analysisId" = ${id} AND "schoolId" = ${schoolId} ORDER BY "createdAt" ASC`;
        }
        catch (err) {
            console.warn("Could not fetch decisions raw:", err);
        }
        return {
            ...report,
            decisions
        };
    }
};
//# sourceMappingURL=analytics.service.js.map