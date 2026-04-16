import { Router } from 'express';
import multer from 'multer';
import { bulkImportController } from './bulk-import.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: Bulk Import
 *   description: Importations massives de données via CSV
 */

/**
 * @swagger
 * /api/bulk-import/students:
 *   post:
 *     summary: "[ADMIN+] Importation groupée d'étudiants (CSV)"
 *     description: "Crée massivement des comptes étudiants. Format CSV attendu: email,firstName,lastName,matricule,classId."
 *     tags: [Bulk Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               campusId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Importation terminée
 */
router.post(
  '/students',
  authMiddleware,
  requireRole(Role.ADMIN, Role.SUPERADMIN),
  upload.single('file'),
  bulkImportController.importStudents
);

/**
 * @swagger
 * /api/bulk-import/professors:
 *   post:
 *     summary: "[ADMIN+] Importation groupée de professeurs (CSV)"
 *     description: "Crée massivement des profs. Format CSV attendu: email,firstName,lastName."
 *     tags: [Bulk Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               campusId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Importation terminée
 */
router.post(
  '/professors',
  authMiddleware,
  requireRole(Role.ADMIN, Role.SUPERADMIN),
  upload.single('file'),
  bulkImportController.importProfessors
);

export { router as bulkImportRouter };
