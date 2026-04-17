import { Router } from 'express';
import { classesController } from './classes.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { createClassSchema, updateClassSchema, classParamsSchema, classQuerySchema } from './classes.schema';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Gestion des classes académiques
 */

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Liste des classes (Filtres)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: levelId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des classes
 */
router.get('/', authMiddleware, validate({ query: classQuerySchema }), classesController.getAll);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Détail d'une classe
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail de la classe
 */
router.get('/:id', authMiddleware, validate({ params: classParamsSchema }), classesController.getById);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Créer une classe (Admin/Manager)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, levelId, campusId]
 *             properties:
 *               name: { type: string }
 *               levelId: { type: string, format: uuid }
 *               campusId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Classe créée
 */
router.post(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ body: createClassSchema }),
  classesController.create
);

/**
 * @swagger
 * /api/classes/{id}:
 *   patch:
 *     summary: Modifier une classe
 *     tags: [Classes]
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
 *               levelId: { type: string, format: uuid }
 *               campusId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Mis à jour
 */
router.patch(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ params: classParamsSchema, body: updateClassSchema }),
  classesController.update
);

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Supprimer une classe
 *     tags: [Classes]
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
  validate({ params: classParamsSchema }),
  classesController.remove
);

/**
 * @swagger
 * /api/classes/{id}/students:
 *   get:
 *     summary: "Lister les étudiants d'une classe"
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste des étudiants
 */
router.get(
  '/:id/students',
  authMiddleware,
  validate({ params: classParamsSchema }),
  classesController.getStudents
);

export { router as classesRouter };
