"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRouter = void 0;
const express_1 = require("express");
const notifications_controller_1 = require("./notifications.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
exports.notificationsRouter = router;
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Système d'alertes et messages internes
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupérer mes notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean }
 *         description: Filtrer notifications lues/non lues
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [AI_FAILURE, EVALUATION_CAMPAIGN, EVALUATION_CAMPAIGN_REMINDER, SYSTEM]
 *         description: Filtrer par type de notification
 *     responses:
 *       200:
 *         description: Liste des notifications (user + globales)
 */
router.get('/', notifications_controller_1.notificationsController.getMyNotifications);
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 */
router.patch('/:id/read', notifications_controller_1.notificationsController.markAsRead);
//# sourceMappingURL=notifications.route.js.map