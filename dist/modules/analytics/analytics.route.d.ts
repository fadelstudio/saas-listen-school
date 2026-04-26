declare const router: import("express-serve-static-core").Router;
/**
 * @swagger
 * /api/analytics/global-analysis:
 *   post:
 *     summary: "[ADMIN+] Lancer une analyse globale IA transversale"
 *     description: Analyse les signalements et évaluations selon des filtres pour générer un rapport et des propositions de décision.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "Audit satisfaction Campus Nord" }
 *               campusId: { type: string, format: uuid }
 *               classId: { type: string, format: uuid }
 *               professorId: { type: string, format: uuid }
 *               moduleId: { type: string, format: uuid }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               includeReports: { type: boolean, default: true }
 *               includeEvaluations: { type: boolean, default: true }
 *     responses:
 *       200:
 *         description: Analyse terminée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     report: { type: object }
 *                     decisionsCreatedCount: { type: integer }
 *                     aiSummary: { type: string }
 */
export { router as analyticsRouter };
//# sourceMappingURL=analytics.route.d.ts.map