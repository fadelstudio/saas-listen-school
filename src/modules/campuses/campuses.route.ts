import { Router } from 'express';
import { campusesController } from './campuses.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { createCampusSchema, updateCampusSchema, campusParamsSchema } from './campuses.schema';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Campuses
 *   description: Gestion des campus physiques
 */

/**
 * @swagger
 * /api/campuses:
 *   get:
 *     summary: Liste de tous les campus
 *     tags: [Campuses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des campus
 */
router.get('/', authMiddleware, campusesController.getAll);

/**
 * @swagger
 * /api/campuses/{id}:
 *   get:
 *     summary: Détail d'un campus
 *     tags: [Campuses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail du campus
 */
router.get('/:id', authMiddleware, validate({ params: campusParamsSchema }), campusesController.getById);

/**
 * @swagger
 * /api/campuses:
 *   post:
 *     summary: Créer un campus (Admin/Manager)
 *     tags: [Campuses]
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
 *               name: { type: string }
 *               location: { type: string }
 *     responses:
 *       201:
 *         description: Campus créé
 */
router.post(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ body: createCampusSchema }),
  campusesController.create
);

/**
 * @swagger
 * /api/campuses/{id}:
 *   patch:
 *     summary: Modifier un campus
 *     tags: [Campuses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Mis à jour
 */
router.patch(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ params: campusParamsSchema, body: updateCampusSchema }),
  campusesController.update
);

/**
 * @swagger
 * /api/campuses/{id}:
 *   delete:
 *     summary: Supprimer un campus
 *     tags: [Campuses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate({ params: campusParamsSchema }),
  campusesController.remove
);

export { router as campusesRouter };
