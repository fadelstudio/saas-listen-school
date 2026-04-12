import { Router } from 'express';
import multer from 'multer';
import { uploadsController } from './uploads.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

export const uploadsRouter = Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

/**
 * @swagger
 * /api/uploads:
 *   post:
 *     summary: Upload a file
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 default: general
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
uploadsRouter.post(
  '/',
  authMiddleware,
  upload.single('file'),
  uploadsController.upload
);
