import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Système d'alertes et messages internes
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupérer mes notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des notifications (user + globales)
 */
router.get('/', notificationsController.getMyNotifications);

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
router.patch('/:id/read', notificationsController.markAsRead);

export { router as notificationsRouter };
