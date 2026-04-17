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
 *   name: Academic Modules
 *   description: Gestion des matières et unités d'enseignement (Matières académiques)
 */

/**
 * @swagger
 * /api/academic-modules:
 *   get:
 *     summary: "Liste de toutes les matières académiques"
 *     tags: [Academic Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         description: Recherche par nom ou code de matière
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée des matières
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', authMiddleware, validate({ query: academicModuleQuerySchema }), academicModulesController.getAll);

/**
 * @swagger
 * /api/academic-modules/{id}:
 *   get:
 *     summary: "Détail d'une matière académique"
 *     tags: [Academic Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Fiche détaillée de la matière
 */
router.get('/:id', authMiddleware, validate({ params: academicModuleParamsSchema }), academicModulesController.getById);

/**
 * @swagger
 * /api/academic-modules:
 *   post:
 *     summary: "Créer une nouvelle matière (Admin+)"
 *     tags: [Academic Modules]
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
 *               name: { type: string, example: "Algorithmique Avancée" }
 *               code: { type: string, example: "ALGO-301" }
 *     responses:
 *       201:
 *         description: Matière créée avec succès
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
 *     summary: "Modifier une matière académique"
 *     tags: [Academic Modules]
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
 *         description: Informations mises à jour
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
 *     summary: "Supprimer une matière (ADMIN+)"
 *     tags: [Academic Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Supprimée définitivement
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate({ params: academicModuleParamsSchema }),
  academicModulesController.remove
);

export { router as academicModulesRouter };
