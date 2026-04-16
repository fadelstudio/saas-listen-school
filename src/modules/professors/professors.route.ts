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
 *   description: Gestion du corps enseignant et des affectations
 */

/**
 * @swagger
 * /api/professors:
 *   get:
 *     summary: "Liste des professeurs (Filtres)"
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
 *         description: Recherche par nom ou email
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste paginée des professeurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', authMiddleware, validate({ query: professorQuerySchema }), professorsController.getAll);

/**
 * @swagger
 * /api/professors/{id}:
 *   get:
 *     summary: "Détail complet d'un professeur"
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
 *         description: Fiche détaillée du professeur
 */
router.get('/:id', authMiddleware, validate({ params: professorParamsSchema }), professorsController.getById);

/**
 * @swagger
 * /api/professors:
 *   post:
 *     summary: "Créer un professeur (Admin/Manager)"
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
 *               firstName: { type: string, example: "Moussa" }
 *               lastName: { type: string, example: "Faye" }
 *               email: { type: string, format: email, example: "moussa.faye@afi.com" }
 *               campusId: { type: string, format: uuid, description: "Campus d'affectation principal" }
 *               matricule: { type: string, example: "PROF-2024-001" }
 *     responses:
 *       201:
 *         description: Professeur créé avec succès
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
 *     summary: "Modifier la fiche d'un professeur"
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
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Informations mises à jour
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
 *     summary: "Supprimer un professeur (ADMIN+)"
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
 *         description: Supprimé définitivement
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate({ params: professorParamsSchema }),
  professorsController.remove
);

export { router as professorsRouter };
