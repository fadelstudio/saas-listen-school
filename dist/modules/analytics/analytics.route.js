"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const analytics_controller_1 = require("./analytics.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.analyticsRouter = router;
/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Données agrégées pour le pilotage (Dashboards)
 */
/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: "[MANAGER+] Statistiques globales du dashboard"
 *     description: Retourne des compteurs et distributions pour les graphiques.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *         description: Optionnel. Filtrer pour un campus spécifique.
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
router.get('/dashboard', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.SUPERADMIN), analytics_controller_1.analyticsController.getDashboard);
//# sourceMappingURL=analytics.route.js.map