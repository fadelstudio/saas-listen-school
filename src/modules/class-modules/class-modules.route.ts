import { Router } from 'express';
import { classModulesController } from './class-modules.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { createAssignmentSchema, updateAssignmentSchema, assignmentParamsSchema, assignmentQuerySchema } from './class-modules.schema';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Affectations des matières (modules) aux classes et affectation des professeurs référents
 */

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: "Liste de toutes les affectations (Filtrable)"
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         description: Filtrer par classe
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: moduleId
 *         description: Filtrer par matière académique
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: campusId
 *         description: Filtrer par campus (Admin+)
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste paginée des affectations récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', authMiddleware, validate({ query: assignmentQuerySchema }), classModulesController.getAll);

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: "Détail d'une affectation spécifique"
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Fiche détaillée de l'affectation (inclut profs, module, classe)
 */
router.get('/:id', authMiddleware, validate({ params: assignmentParamsSchema }), classModulesController.getById);

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: "Créer une nouvelle affectation (Admin+)"
 *     description: Lie une matière à une classe et optionnellement définit les professeurs.
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [classId, moduleId]
 *             properties:
 *               classId: { type: string, format: uuid, example: "uuid-class" }
 *               moduleId: { type: string, format: uuid, example: "uuid-module" }
 *               professorIds: { type: array, items: { type: string, format: uuid }, description: "Liste des profs enseignant ce module dans cette classe" }
 *     responses:
 *       201:
 *         description: Affectation créée avec succès
 */
router.post(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ body: createAssignmentSchema }),
  classModulesController.create
);

/**
 * @swagger
 * /api/assignments/{id}:
 *   patch:
 *     summary: "Modifier une affectation (Mise à jour des professeurs)"
 *     tags: [Assignments]
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
 *               professorIds: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Affectation mise à jour
 */
router.patch(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ params: assignmentParamsSchema, body: updateAssignmentSchema }),
  classModulesController.update
);

/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: "Supprimer une affectation (ADMIN+)"
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Affectation supprimée définitivement
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate({ params: assignmentParamsSchema }),
  classModulesController.remove
);

export { router as classModulesRouter };
