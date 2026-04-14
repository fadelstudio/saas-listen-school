import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createSchoolUserSchema,
  updateSchoolUserSchema,
  schoolUserParamsSchema,
  schoolUserQuerySchema,
} from './school-users.schema';
import { schoolUsersController } from './school-users.controller';

export const schoolUsersRouter = Router();

schoolUsersRouter.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: School users
 *   description: Gestion des comptes par l'administrateur d'école (ADMIN)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SchoolUser:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         email: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         role: { type: string, enum: [ADMIN, MANAGER, AGENT, VIEWER, STUDENT] }
 *         isActive: { type: boolean }
 *         matricule: { type: string, nullable: true }
 *         classId: { type: string, format: uuid, nullable: true }
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/school-users/{id}:
 *   get:
 *     summary: Récupérer le détail d'un utilisateur du campus
 *     tags: [School users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolUser'
 */
schoolUsersRouter.get(
  '/:id',
  validate({ params: schoolUserParamsSchema }),
  schoolUsersController.getById
);

/**
 * @swagger
 * /api/school-users:
 *   post:
 *     summary: Créer un utilisateur (Par ADMIN campus)
 *     tags: [School users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, firstName, lastName, role, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8, example: "Password123!" }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               role: { type: string, enum: [MANAGER, AGENT, VIEWER, STUDENT] }
 *               matricule: { type: string }
 *               classId: { type: string, format: uuid, description: "Obligatoire si STUDENT" }
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolUser'
 */
schoolUsersRouter.post(
  '/',
  validate({ body: createSchoolUserSchema }),
  schoolUsersController.create
);

/**
 * @swagger
 * /api/school-users:
 *   get:
 *     summary: Lister les utilisateurs du campus actuel
 *     tags: [School users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchoolUser'
 */
schoolUsersRouter.get(
  '/',
  validate({ query: schoolUserQuerySchema }),
  schoolUsersController.list
);

/**
 * @swagger
 * /api/school-users/{id}:
 *   patch:
 *     summary: Mettre à jour rôle, statut ou classe d'un compte
 *     tags: [School users]
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
 *               role: { type: string, enum: [ADMIN, MANAGER, AGENT, VIEWER, STUDENT] }
 *               isActive: { type: boolean }
 *               classId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolUser'
 */
schoolUsersRouter.patch(
  '/:id',
  validate({ params: schoolUserParamsSchema, body: updateSchoolUserSchema }),
  schoolUsersController.update
);

/**
 * @swagger
 * /api/school-users/{id}:
 *   delete:
 *     summary: Désactiver ou supprimer un compte utilisateur
 *     tags: [School users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Utilisateur supprimé/désactivé
 */
schoolUsersRouter.delete(
  '/:id',
  validate({ params: schoolUserParamsSchema }),
  schoolUsersController.delete
);
