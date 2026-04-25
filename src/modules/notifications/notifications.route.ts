import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';

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
 *         description: Filtrer par statut de lecture
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [AI_FAILURE, EVALUATION_CAMPAIGN, EVALUATION_CAMPAIGN_REMINDER, SYSTEM, DECISION_TAKEN, NEW_REPORT]
 *         description: Filtrer par catégorie d'alerte
 *     responses:
 *       200:
 *         description: Flux de notifications (personnelles et annonces globales)
 */
router.get('/', notificationsController.getMyNotifications);

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
 *         description: Statut mis à jour avec succès
 */
router.patch('/:id/read', notificationsController.markAsRead);

/**
 * @swagger
 * /api/notifications/broadcast:
 *   post:
 *     summary: "Envoyer un message groupé (Admin/Manager)"
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
 *               targetRole: { type: string, enum: [ADMIN, MANAGER, AGENT, STUDENT, PROFESSOR] }
 *               targetCampusId: { type: string, format: uuid }
 *               targetClassId: { type: string, format: uuid }
 *               url: { type: string }
 *               attachments: { type: array, items: { type: object } }
 *     responses:
 *       201:
 *         description: Broadcast envoyé
 */
router.post('/broadcast', authMiddleware, requireRole('ADMIN', 'MANAGER'), notificationsController.sendBroadcast);

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
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'MANAGER'), notificationsController.deleteNotification);

export { router as notificationsRouter };
