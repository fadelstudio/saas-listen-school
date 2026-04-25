"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRouter = void 0;
const express_1 = require("express");
const notifications_controller_1 = require("./notifications.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const notifications_schema_1 = require("./notifications.schema");
const router = (0, express_1.Router)();
exports.notificationsRouter = router;
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Système d'alertes et messages internes (Push/In-app)
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: "Récupérer le flux de notifications de l'utilisateur"
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [AI_FAILURE, EVALUATION_CAMPAIGN, EVALUATION_CAMPAIGN_REMINDER, SYSTEM, BROADCAST]
 *     responses:
 *       200:
 *         description: Flux de notifications
 */
router.get('/', (0, validate_middleware_1.validate)({ query: notifications_schema_1.notificationsSchema.query }), notifications_controller_1.notificationsController.getMyNotifications);
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: "Marquer une notification comme lue"
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/:id/read', (0, validate_middleware_1.validate)({ params: notifications_schema_1.notificationsSchema.params }), notifications_controller_1.notificationsController.markAsRead);
/**
 * @swagger
 * /api/notifications/broadcast:
 *   post:
 *     summary: "Envoyer un message groupé (Admin/Manager)"
 *     description: Permet de cibler par rôles, campus, classes ou IDs utilisateurs spécifiques.
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message]
 *             properties:
 *               title: { type: string }
 *               message: { type: string }
 *               targetRoles: { type: array, items: { type: string } }
 *               targetCampusIds: { type: array, items: { type: string, format: uuid } }
 *               targetClassIds: { type: array, items: { type: string, format: uuid } }
 *               targetUserIds: { type: array, items: { type: string, format: uuid } }
 *               url: { type: string }
 *     responses:
 *       201:
 *         description: Broadcast envoyé
 */
router.post('/broadcast', (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), (0, validate_middleware_1.validate)({ body: notifications_schema_1.notificationsSchema.sendBroadcast }), notifications_controller_1.notificationsController.sendBroadcast);
/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: "Supprimer une notification"
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Succès
 */
router.delete('/:id', (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), (0, validate_middleware_1.validate)({ params: notifications_schema_1.notificationsSchema.params }), notifications_controller_1.notificationsController.deleteNotification);
//# sourceMappingURL=notifications.route.js.map