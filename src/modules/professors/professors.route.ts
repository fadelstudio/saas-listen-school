import { Router } from 'express';
import { professorsController } from './professors.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { createProfessorSchema, updateProfessorSchema, professorParamsSchema, professorQuerySchema } from './professors.schema';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Professors
 *   description: Gestion du corps enseignant
 */

/**
 * @swagger
 * /api/professors:
 *   get:
 *     summary: Liste des professeurs (Filtres)
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des professeurs
 */
router.get('/', authMiddleware, validate({ query: professorQuerySchema }), professorsController.getAll);

/**
 * @swagger
 * /api/professors/{id}:
 *   get:
 *     summary: Détail d'un professeur
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail
 */
router.get('/:id', authMiddleware, validate({ params: professorParamsSchema }), professorsController.getById);

/**
 * @swagger
 * /api/professors:
 *   post:
 *     summary: Créer un professeur (Admin/Manager)
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               campusId: { type: string, format: uuid, description: "Facultatif : Campus d'affectation principal" }
 *     responses:
 *       201:
 *         description: Créé
 */
router.post(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ body: createProfessorSchema }),
  professorsController.create
);

/**
 * @swagger
 * /api/professors/{id}:
 *   patch:
 *     summary: Modifier un professeur
 *     tags: [Professors]
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               campusId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Mis à jour
 */
router.patch(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ params: professorParamsSchema, body: updateProfessorSchema }),
  professorsController.update
);

/**
 * @swagger
 * /api/professors/{id}:
 *   delete:
 *     summary: Supprimer un professeur
 *     tags: [Professors]
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
  validate({ params: professorParamsSchema }),
  professorsController.remove
);

export { router as professorsRouter };
