import { Router } from 'express';
import { levelsController } from './levels.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { createLevelSchema, updateLevelSchema, levelParamsSchema } from './levels.schema';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Levels
 *   description: Gestion dynamique des niveaux académiques
 */

/**
 * @swagger
 * /api/levels:
 *   get:
 *     summary: Liste de tous les niveaux
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des niveaux
 */
router.get('/', authMiddleware, levelsController.getAll);

/**
 * @swagger
 * /api/levels/{id}:
 *   get:
 *     summary: Détail d'un niveau
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détails du niveau
 */
router.get('/:id', authMiddleware, validate({ params: levelParamsSchema }), levelsController.getById);

/**
 * @swagger
 * /api/levels:
 *   post:
 *     summary: Créer un niveau (Admin)
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "L1" }
 *               order: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Niveau créé
 */
router.post(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate({ body: createLevelSchema }),
  levelsController.create
);

/**
 * @swagger
 * /api/levels/{id}:
 *   patch:
 *     summary: Modifier un niveau
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               order: { type: integer }
 *     responses:
 *       200:
 *         description: Niveau mis à jour
 */
router.patch(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate({ params: levelParamsSchema, body: updateLevelSchema }),
  levelsController.update
);

/**
 * @swagger
 * /api/levels/{id}:
 *   delete:
 *     summary: Supprimer un niveau
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Niveau supprimé
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate({ params: levelParamsSchema }),
  levelsController.remove
);

export { router as levelsRouter };
