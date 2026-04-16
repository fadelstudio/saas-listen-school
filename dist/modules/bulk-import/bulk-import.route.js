"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const bulk_import_controller_1 = require("./bulk-import.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.bulkImportRouter = router;
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
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
 *     description: Crée massivement des comptes étudiants. Format CSV attendu: email,firstName,lastName,matricule,classId.
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
router.post('/students', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), upload.single('file'), bulk_import_controller_1.bulkImportController.importStudents);
/**
 * @swagger
 * /api/bulk-import/professors:
 *   post:
 *     summary: "[ADMIN+] Importation groupée de professeurs (CSV)"
 *     description: Crée massivement des profs. Format CSV attendu: email,firstName,lastName.
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
router.post('/professors', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), upload.single('file'), bulk_import_controller_1.bulkImportController.importProfessors);
//# sourceMappingURL=bulk-import.route.js.map