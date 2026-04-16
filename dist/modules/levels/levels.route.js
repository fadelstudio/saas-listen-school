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
 *   description: Gestion dynamique des niveaux académiques (L1, L2, Master, etc.)
 */
/**
 * @swagger
 * /api/levels:
 *   get:
 *     summary: "Liste ordonnée de tous les niveaux"
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des niveaux triés par ordre croissant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       name: { type: string, example: "Licence 1" }
 *                       order: { type: integer, example: 1 }
 */
router.get('/', auth_middleware_1.authMiddleware, levels_controller_1.levelsController.getAll);
/**
 * @swagger
 * /api/levels/{id}:
 *   get:
 *     summary: "Détail d'un niveau académique"
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
 *     summary: "Créer un nouveau niveau (ADMIN+)"
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
 *               name: { type: string, example: "Licence 3 - Génie Logiciel" }
 *               order: { type: integer, example: 3, description: "Position d'affichage" }
 *     responses:
 *       201:
 *         description: Niveau créé avec succès
 */
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ body: levels_schema_1.createLevelSchema }), levels_controller_1.levelsController.create);
/**
 * @swagger
 * /api/levels/{id}:
 *   patch:
 *     summary: "Modifier un niveau existant"
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
 *     summary: "Supprimer un niveau (ADMIN+)"
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
 *         description: Niveau supprimé définitivement
 */
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ params: levels_schema_1.levelParamsSchema }), levels_controller_1.levelsController.remove);
//# sourceMappingURL=levels.route.js.map