import { Router } from 'express';
import { saasController } from './saas.controller';
import { validate } from '../../core/middleware/validate.middleware';
import { createSchoolSchema } from './saas.schema';
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

export default saasRouter;
