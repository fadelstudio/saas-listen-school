import { Router } from 'express';
import multer from 'multer';
import { uploadsController } from './uploads.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { env } from '../../core/config/env';

export const uploadsRouter = Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/mp4',
      'video/webm',
      'video/mp4',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté'));
    }
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
