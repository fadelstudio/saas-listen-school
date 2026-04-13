"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classModulesRouter = void 0;
const express_1 = require("express");
const class_modules_controller_1 = require("./class-modules.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const class_modules_schema_1 = require("./class-modules.schema");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.classModulesRouter = router;
/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Affectations de modules aux classes et professeurs
 */
/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Liste des affectations (Filtrable par classe ou module)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: moduleId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste des affectations
 */
router.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: class_modules_schema_1.assignmentQuerySchema }), class_modules_controller_1.classModulesController.getAll);
/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Détail d'une affectation
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail
 */
router.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: class_modules_schema_1.assignmentParamsSchema }), class_modules_controller_1.classModulesController.getById);
/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Assigner un module à une classe (Admin/Manager)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [classId, moduleId]
 *             properties:
 *               classId: { type: string, format: uuid }
 *               moduleId: { type: string, format: uuid }
 *               professorIds: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       201:
 *         description: Affectation créée
 */
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ body: class_modules_schema_1.createAssignmentSchema }), class_modules_controller_1.classModulesController.create);
/**
 * @swagger
 * /api/assignments/{id}:
 *   patch:
 *     summary: Modifier les professeurs d'une affectation
 *     tags: [Assignments]
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
 *               professorIds: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Mis à jour
 */
router.patch('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ params: class_modules_schema_1.assignmentParamsSchema, body: class_modules_schema_1.updateAssignmentSchema }), class_modules_controller_1.classModulesController.update);
/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: Supprimer une affectation
 *     tags: [Assignments]
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
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ params: class_modules_schema_1.assignmentParamsSchema }), class_modules_controller_1.classModulesController.remove);
//# sourceMappingURL=class-modules.route.js.map