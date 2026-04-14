import { Router } from 'express';
import { saasController } from './saas.controller';
import { validate } from '../../core/middleware/validate.middleware';
import { createSchoolSchema, updateSchoolSchema, schoolParamsSchema } from './saas.schema';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { Role } from '@prisma/client';

const saasRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSchoolInput:
 *       type: object
 *       required: [name, adminEmail, adminPassword, adminFirstName, adminLastName]
 *       properties:
 *         name: { type: string, example: "AFI Dakar" }
 *         location: { type: string, example: "Dakar, Plateau" }
 *         adminEmail: { type: string, format: email, example: "admin@afi.com" }
 *         adminPassword: { type: string, minLength: 8, example: "fadeldev" }
 *         adminFirstName: { type: string, example: "Jean" }
 *         adminLastName: { type: string, example: "Dupont" }
 *         matricule: { type: string, example: "ADM-AFI-001" }
 */

/**
 * @swagger
 * /api/saas/schools:
 *   post:
 *     summary: "[SUPERADMIN] Créer une nouvelle école (Campus + Premier Admin)"
 *     tags: [SaaS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolInput'
 *     responses:
 *       201:
 *         description: École et admin créés avec succès
 */
saasRouter.post(
  '/schools',
  authMiddleware,
  requireRole(Role.SUPERADMIN),
  validate({ body: createSchoolSchema }),
  saasController.createSchool
);

/**
 * @swagger
 * /api/saas/schools:
 *   get:
 *     summary: "[SUPERADMIN] List all schools/campuses"
 *     tags: [SaaS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des campus récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   name: { type: string }
 *                   location: { type: string }
 *                   _count:
 *                     type: object
 *                     properties:
 *                       users: { type: number }
 *                       classes: { type: number }
 */
saasRouter.get(
  '/schools',
  authMiddleware,
  requireRole(Role.SUPERADMIN),
  saasController.listSchools
);

/**
 * @swagger
 * /api/saas/schools/{id}:
 *   get:
 *     summary: "[SUPERADMIN] Détails détaillés d'une école"
 *     tags: [SaaS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détails de l'école (campus)
 *       404:
 *         description: École non trouvée
 */
saasRouter.get(
  '/schools/:id',
  authMiddleware,
  requireRole(Role.SUPERADMIN),
  validate({ params: schoolParamsSchema }),
  saasController.getById
);

/**
 * @swagger
 * /api/saas/schools/{id}:
 *   patch:
 *     summary: "[SUPERADMIN] Modifier les informations d'une école"
 *     tags: [SaaS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "AFI-L'Université" }
 *               location: { type: string, example: "Dakar, Sacré-Coeur" }
 *     responses:
 *       200:
 *         description: École mise à jour avec succès
 */
saasRouter.patch(
  '/schools/:id',
  authMiddleware,
  requireRole(Role.SUPERADMIN),
  validate({ params: schoolParamsSchema, body: updateSchoolSchema }),
  saasController.update
);

export default saasRouter;
