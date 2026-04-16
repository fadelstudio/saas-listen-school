import { Router } from 'express';
import { saasController } from './saas.controller';
import { validate } from '../../core/middleware/validate.middleware';
import { createSchoolSchema, updateSchoolSchema, schoolParamsSchema } from './saas.schema';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { Role } from '@prisma/client';

const saasRouter = Router();

/**
 * @swagger
 * tags:
 *   name: SaaS
 *   description: Gestion multi-tenant des écoles et des campus (SUPERADMIN uniquement)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSchoolInput:
 *       type: object
 *       required: [name, adminEmail, adminPassword, adminFirstName, adminLastName]
 *       properties:
 *         name: { type: string, example: "Groupe AFI - Dakar" }
 *         location: { type: string, example: "Point E, Dakar" }
 *         adminEmail: { type: string, format: email, example: "admin.afi@groupes.com" }
 *         adminPassword: { type: string, minLength: 8, example: "AFI_Admin_2026!" }
 *         adminFirstName: { type: string, example: "Adama" }
 *         adminLastName: { type: string, example: "Diop" }
 *         matricule: { type: string, example: "ADM-AFI-01" }
 */

/**
 * @swagger
 * /api/saas/schools:
 *   post:
 *     summary: "[SUPERADMIN] Créer une nouvelle école (Tenant)"
 *     description: Initialise un nouveau campus et crée le premier compte Administrateur pour ce campus.
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
 *         description: École (Campus) créée avec son administrateur référent.
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
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste exhaustive des tenats (Écoles)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: 
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       name: { type: string }
 *                       campuses: { type: array, items: { type: object } }
 *                       _count: { type: object }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
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
 *     summary: "[SUPERADMIN] Détails d'une école"
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
 *         description: Fiche technique du campus
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
 *     summary: "[SUPERADMIN] Modifier les métadonnées d'une école"
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
 *               name: { type: string, example: "AFI Université Internationale" }
 *               location: { type: string, example: "Dakar Plateau, Immeuble AFI" }
 *     responses:
 *       200:
 *         description: Modifications appliquées
 */
saasRouter.patch(
  '/schools/:id',
  authMiddleware,
  requireRole(Role.SUPERADMIN),
  validate({ params: schoolParamsSchema, body: updateSchoolSchema }),
  saasController.update
);

export default saasRouter;
