"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classesRouter = void 0;
const express_1 = require("express");
const classes_controller_1 = require("./classes.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const classes_schema_1 = require("./classes.schema");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.classesRouter = router;
/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Gestion des classes académiques
 */
/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Liste des classes (Filtres)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: levelId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste des classes
 */
router.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: classes_schema_1.classQuerySchema }), classes_controller_1.classesController.getAll);
/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Détail d'une classe
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail de la classe
 */
router.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: classes_schema_1.classParamsSchema }), classes_controller_1.classesController.getById);
/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Créer une classe (Admin/Manager)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, campusId]
 *             properties:
 *               name: { type: string }
 *               levelId: { type: string, format: uuid }
 *               campusId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Classe créée
 */
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ body: classes_schema_1.createClassSchema }), classes_controller_1.classesController.create);
/**
 * @swagger
 * /api/classes/{id}:
 *   patch:
 *     summary: Modifier une classe
 *     tags: [Classes]
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
 *               levelId: { type: string, format: uuid }
 *               campusId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Mis à jour
 */
router.patch('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ params: classes_schema_1.classParamsSchema, body: classes_schema_1.updateClassSchema }), classes_controller_1.classesController.update);
/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Supprimer une classe
 *     tags: [Classes]
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
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ params: classes_schema_1.classParamsSchema }), classes_controller_1.classesController.remove);
//# sourceMappingURL=classes.route.js.map