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
 * /api/school-users:
 *   post:
 *     summary: Créer un utilisateur (MANAGER, AGENT, VIEWER, STUDENT)
 *     tags: [School users]
 *     security:
 *       - bearerAuth: []
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
 *     summary: Lister les utilisateurs du campus
 *     tags: [School users]
 *     security:
 *       - bearerAuth: []
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
 *     summary: Mettre à jour rôle, statut ou classe
 *     tags: [School users]
 *     security:
 *       - bearerAuth: []
 */
schoolUsersRouter.patch(
  '/:id',
  validate({ params: schoolUserParamsSchema, body: updateSchoolUserSchema }),
  schoolUsersController.update
);
