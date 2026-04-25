import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { notificationsSchema } from './notifications.schema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Système d'alertes et messages internes (Push/In-app)
 */

router.use(authMiddleware);

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
router.get('/', validate({ query: notificationsSchema.query }), notificationsController.getMyNotifications);

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
router.patch('/:id/read', validate({ params: notificationsSchema.params }), notificationsController.markAsRead);

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
router.post(
  '/broadcast', 
  requireRole('ADMIN', 'MANAGER'), 
  validate({ body: notificationsSchema.sendBroadcast }), 
  notificationsController.sendBroadcast
);

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
router.delete(
  '/:id', 
  requireRole('ADMIN', 'MANAGER'), 
  validate({ params: notificationsSchema.params }), 
  notificationsController.deleteNotification
);

export { router as notificationsRouter };
