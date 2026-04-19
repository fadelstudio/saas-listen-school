import multer from 'multer';
import { env } from '../config/env';
import { BadRequestError } from '../errors/AppError';

const storage = multer.memoryStorage();
const maxMb = Math.min(5, env.MAX_FILE_SIZE_MB);

/** Multipart `file` — JPEG / PNG / WebP uniquement (photo de profil). */
export const profilePhotoUpload = multer({
  storage,
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    if (!ok) {
      cb(new BadRequestError('Only JPEG, PNG or WebP images are allowed'));
      return;
    }
    cb(null, true);
  },
});
