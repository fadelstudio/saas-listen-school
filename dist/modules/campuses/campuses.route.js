"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campusesRouter = void 0;
const express_1 = require("express");
const campuses_controller_1 = require("./campuses.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const campuses_schema_1 = require("./campuses.schema");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.campusesRouter = router;
/**
 * @swagger
 * tags:
 *   name: Campuses
 *   description: Gestion des campus physiques
 */
/**
 * @swagger
 * /api/campuses:
 *   get:
 *     summary: Liste de tous les campus
 *     tags: [Campuses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des campus
 */
router.get('/', auth_middleware_1.authMiddleware, campuses_controller_1.campusesController.getAll);
/**
 * @swagger
 * /api/campuses/{id}:
 *   get:
 *     summary: Détail d'un campus
 *     tags: [Campuses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail du campus
 */
router.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: campuses_schema_1.campusParamsSchema }), campuses_controller_1.campusesController.getById);
/**
 * @swagger
 * /api/campuses:
 *   post:
 *     summary: Créer un campus (Admin/Manager)
 *     tags: [Campuses]
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
 *               name: { type: string }
 *               location: { type: string }
 *     responses:
 *       201:
 *         description: Campus créé
 */
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ body: campuses_schema_1.createCampusSchema }), campuses_controller_1.campusesController.create);
/**
 * @swagger
 * /api/campuses/{id}:
 *   patch:
 *     summary: Modifier un campus
 *     tags: [Campuses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Mis à jour
 */
router.patch('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ params: campuses_schema_1.campusParamsSchema, body: campuses_schema_1.updateCampusSchema }), campuses_controller_1.campusesController.update);
/**
 * @swagger
 * /api/campuses/{id}:
 *   delete:
 *     summary: Supprimer un campus
 *     tags: [Campuses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ params: campuses_schema_1.campusParamsSchema }), campuses_controller_1.campusesController.remove);
//# sourceMappingURL=campuses.route.js.map