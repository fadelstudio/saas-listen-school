"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uploads_controller_1 = require("./uploads.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const env_1 = require("../../core/config/env");
exports.uploadsRouter = (0, express_1.Router)();
// Multer setup
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: env_1.env.MAX_FILE_SIZE_MB * 1024 * 1024,
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
        }
        else {
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
exports.uploadsRouter.post('/', auth_middleware_1.authMiddleware, upload.single('file'), uploads_controller_1.uploadsController.upload);
//# sourceMappingURL=uploads.route.js.map