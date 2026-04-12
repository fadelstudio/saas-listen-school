import { Router } from 'express';
import { academicModulesController } from './academic-modules.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { createAcademicModuleSchema, updateAcademicModuleSchema, academicModuleParamsSchema, academicModuleQuerySchema } from './academic-modules.schema';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AcademicModules
 *   description: Gestion des matières et unités d'enseignement
 */

/**
 * @swagger
 * /api/academic-modules:
 *   get:
 *     summary: Liste des modules académiques
 *     tags: [AcademicModules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des modules
 */
router.get('/', authMiddleware, validate({ query: academicModuleQuerySchema }), academicModulesController.getAll);

/**
 * @swagger
 * /api/academic-modules/{id}:
 *   get:
 *     summary: Détail d'un module académique
 *     tags: [AcademicModules]
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
router.get('/:id', authMiddleware, validate({ params: academicModuleParamsSchema }), academicModulesController.getById);

/**
 * @swagger
 * /api/academic-modules:
 *   post:
 *     summary: Créer un module (Admin/Manager)
 *     tags: [AcademicModules]
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
 *               name: { type: string, example: "Algorithmique" }
 *               code: { type: string, example: "INF-GEN" }
 *     responses:
 *       201:
 *         description: Créé
 */
router.post(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ body: createAcademicModuleSchema }),
  academicModulesController.create
);

/**
 * @swagger
 * /api/academic-modules/{id}:
 *   patch:
 *     summary: Modifier un module académique
 *     tags: [AcademicModules]
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
 *               code: { type: string }
 *     responses:
 *       200:
 *         description: Mis à jour
 */
router.patch(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ params: academicModuleParamsSchema, body: updateAcademicModuleSchema }),
  academicModulesController.update
);

/**
 * @swagger
 * /api/academic-modules/{id}:
 *   delete:
 *     summary: Supprimer un module académique
 *     tags: [AcademicModules]
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
  validate({ params: academicModuleParamsSchema }),
  academicModulesController.remove
);

export { router as academicModulesRouter };
