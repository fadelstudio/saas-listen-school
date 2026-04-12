import { Router } from 'express';
import { evaluationCampaignsController } from './evaluation-campaigns.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Evaluation Campaigns
 *   description: Administration des appels à l'évaluation
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/evaluation-campaigns:
 *   post:
 *     summary: Créer une campagne d'évaluation (Admin)
 *     tags: [Evaluation Campaigns]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', requireRole(Role.ADMIN), evaluationCampaignsController.create);

/**
 * @swagger
 * /api/evaluation-campaigns:
 *   get:
 *     summary: Liste des campagnes
 *     tags: [Evaluation Campaigns]
 */
router.get('/', evaluationCampaignsController.getAll);

/**
 * @swagger
 * /api/evaluation-campaigns/{id}:
 *   get:
 *     summary: Détails d'une campagne
 *     tags: [Evaluation Campaigns]
 */
router.get('/:id', evaluationCampaignsController.getById);

/**
 * @swagger
 * /api/evaluation-campaigns/{id}/close:
 *   post:
 *     summary: Clôturer une campagne
 *     tags: [Evaluation Campaigns]
 */
router.post('/:id/close', requireRole(Role.ADMIN), evaluationCampaignsController.close);

export { router as evaluationCampaignsRouter };
