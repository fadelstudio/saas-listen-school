"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelsRouter = void 0;
const express_1 = require("express");
const levels_controller_1 = require("./levels.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const levels_schema_1 = require("./levels.schema");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.levelsRouter = router;
/**
 * @swagger
 * tags:
 *   name: Levels
 *   description: Gestion dynamique des niveaux académiques
 */
/**
 * @swagger
 * /api/levels:
 *   get:
 *     summary: Liste de tous les niveaux
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des niveaux
 */
router.get('/', auth_middleware_1.authMiddleware, levels_controller_1.levelsController.getAll);
/**
 * @swagger
 * /api/levels/{id}:
 *   get:
 *     summary: Détail d'un niveau
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détails du niveau
 */
router.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: levels_schema_1.levelParamsSchema }), levels_controller_1.levelsController.getById);
/**
 * @swagger
 * /api/levels:
 *   post:
 *     summary: Créer un niveau (Admin)
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "L1" }
 *               order: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Niveau créé
 */
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ body: levels_schema_1.createLevelSchema }), levels_controller_1.levelsController.create);
/**
 * @swagger
 * /api/levels/{id}:
 *   patch:
 *     summary: Modifier un niveau
 *     tags: [Levels]
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
 *               name: { type: string }
 *               order: { type: integer }
 *     responses:
 *       200:
 *         description: Niveau mis à jour
 */
router.patch('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ params: levels_schema_1.levelParamsSchema, body: levels_schema_1.updateLevelSchema }), levels_controller_1.levelsController.update);
/**
 * @swagger
 * /api/levels/{id}:
 *   delete:
 *     summary: Supprimer un niveau
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Niveau supprimé
 */
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ params: levels_schema_1.levelParamsSchema }), levels_controller_1.levelsController.remove);
//# sourceMappingURL=levels.route.js.map