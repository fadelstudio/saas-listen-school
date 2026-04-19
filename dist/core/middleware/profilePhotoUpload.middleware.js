"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilePhotoUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const env_1 = require("../config/env");
const AppError_1 = require("../errors/AppError");
const storage = multer_1.default.memoryStorage();
const maxMb = Math.min(5, env_1.env.MAX_FILE_SIZE_MB);
/** Multipart `file` — JPEG / PNG / WebP uniquement (photo de profil). */
exports.profilePhotoUpload = (0, multer_1.default)({
    storage,
    limits: { fileSize: maxMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
        if (!ok) {
            cb(new AppError_1.BadRequestError('Only JPEG, PNG or WebP images are allowed'));
            return;
        }
        cb(null, true);
    },
});
//# sourceMappingURL=profilePhotoUpload.middleware.js.map