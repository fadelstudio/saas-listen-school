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
 *   description: Affectations de modules aux classes et professeurs
 */

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Liste des affectations (Filtrable par classe ou module)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: moduleId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste des affectations
 */
router.get('/', authMiddleware, validate({ query: assignmentQuerySchema }), classModulesController.getAll);

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Détail d'une affectation
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
 *         description: Détail
 */
router.get('/:id', authMiddleware, validate({ params: assignmentParamsSchema }), classModulesController.getById);

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Assigner un module à une classe (Admin/Manager)
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
 *               classId: { type: string, format: uuid }
 *               moduleId: { type: string, format: uuid }
 *               professorIds: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       201:
 *         description: Affectation créée
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
 *     summary: Modifier les professeurs d'une affectation
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
 *         description: Mis à jour
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
 *     summary: Supprimer une affectation
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
 *         description: Supprimé
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate({ params: assignmentParamsSchema }),
  classModulesController.remove
);

export { router as classModulesRouter };
