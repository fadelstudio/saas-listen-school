import { Router } from 'express';
import { announcementsController } from './announcements.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementParamsSchema,
} from './announcements.schema';

export const announcementsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: Gestion des annonces (PUB)
 */

announcementsRouter.get('/active', announcementsController.getActive);

announcementsRouter.get(
  '/',
  authMiddleware,
  announcementsController.getAll
);

announcementsRouter.post(
  '/',
  authMiddleware,
  validate({ body: createAnnouncementSchema }),
  announcementsController.create
);

announcementsRouter.patch(
  '/:id',
  authMiddleware,
  validate({ params: announcementParamsSchema, body: updateAnnouncementSchema }),
  announcementsController.update
);

announcementsRouter.delete(
  '/:id',
  authMiddleware,
  validate({ params: announcementParamsSchema }),
  announcementsController.remove
);
