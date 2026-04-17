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
 *   name: School Users
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
 * /api/school-users/staff:
 *   get:
 *     summary: "[ADMIN+] Lister le personnel administratif"
 *     description: Récupère uniquement les utilisateurs avec les rôles ADMIN, MANAGER, AGENT ou VIEWER.
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, MANAGER, AGENT, VIEWER] }
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
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
 *         description: Liste du personnel récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: 
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SchoolUser' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
schoolUsersRouter.get(
  '/staff',
  validate({ query: schoolUserQuerySchema }),
  schoolUsersController.listStaff
);

/**
 * @swagger
 * /api/school-users/students:
 *   get:
 *     summary: "[MANAGER+] Lister les étudiants"
 *     description: Récupère uniquement les utilisateurs avec le rôle STUDENT.
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
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
 *         description: Liste des étudiants récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: 
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SchoolUser' }
 */
schoolUsersRouter.get(
  '/students',
  validate({ query: schoolUserQuerySchema }),
  schoolUsersController.listStudents
);

/**
 * @swagger
 * /api/school-users/{id}:
 *   get:
 *     summary: Récupérer le détail d'un utilisateur
 *     tags: [School Users]
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
 *     tags: [School Users]
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
 *     summary: Lister TOUS les utilisateurs (Filtres globaux)
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, MANAGER, AGENT, VIEWER, STUDENT] }
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
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
 *         description: Liste filtrée
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
 *     summary: Mettre à jour un compte utilisateur
 *     tags: [School Users]
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
 *     summary: Supprimer un compte
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
schoolUsersRouter.delete(
  '/:id',
  validate({ params: schoolUserParamsSchema }),
  schoolUsersController.delete
);
