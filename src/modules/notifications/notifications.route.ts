import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authMiddleware, requireRole, optionalAuthMiddleware } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { notificationsSchema } from './notifications.schema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Système d'alertes et messages internes (Push/In-app)
 */

/**
 * @swagger
 * /api/notifications/guest:
 *   get:
 *     summary: "Notifications pour un invité (sans compte)"
 *     description: "Récupère les notifications liées à un UTI. Public mais nécessite un UTI valide."
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: uti
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notifications de l'invité
 */
router.get('/guest', notificationsController.getGuestNotifications);

/**
 * @swagger
 * /api/notifications/fcm-token:
 *   post:
 *     summary: "Mettre à jour le token FCM (Push mobile/web)"
 *     description: "Appelé après login ou au démarrage de l'app. Si un UTI (guest ID) est fourni, fusionne l'historique invité avec le compte. Authentification optionnelle (pour fusion)."
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fcmToken]
 *             properties:
 *               fcmToken: { type: string, description: "Token Firebase Cloud Messaging" }
 *               uti: { type: string, description: "UTI invité à fusionner (optionnel)" }
 *     responses:
 *       200:
 *         description: Token mis à jour
 */
// Utilise un middleware optionnel pour fusionner les comptes correctement
router.post('/fcm-token', optionalAuthMiddleware, notificationsController.updateFcmToken);


// --- Routes protégées ---
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
 *           enum: [AI_FAILURE, EVALUATION_CAMPAIGN, EVALUATION_CAMPAIGN_REMINDER, REPORT_STATUS_CHANGED, NEW_REPORT, SYSTEM, BROADCAST, WELCOME]
 *     responses:
 *       200:
 *         description: Flux de notifications
 */
router.get('/', validate({ query: notificationsSchema.query }), notificationsController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: "Nombre de notifications non lues"
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/unread-count', notificationsController.getUnreadCount);

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
 *               title: { type: string, description: "Titre de la notification" }
 *               message: { type: string, description: "Contenu de la notification" }
 *               targetRoles: { type: array, items: { type: string }, description: "Cibler par rôle (ex: STUDENT, MANAGER)" }
 *               targetCampusIds: { type: array, items: { type: string, format: uuid }, description: "Cibler un ou plusieurs campus" }
 *               targetClassIds: { type: array, items: { type: string, format: uuid }, description: "Cibler une ou plusieurs classes" }
 *               targetUserIds: { type: array, items: { type: string, format: uuid }, description: "Cibler des utilisateurs spécifiques" }
 *               url: { type: string, description: "Lien de redirection au clic" }
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
