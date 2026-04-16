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
 *   description: Affectations des matières (modules) aux classes et affectation des professeurs référents
 */
/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: "Liste de toutes les affectations (Filtrable)"
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         description: Filtrer par classe
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: moduleId
 *         description: Filtrer par matière académique
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: campusId
 *         description: Filtrer par campus (Admin+)
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste paginée des affectations récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: class_modules_schema_1.assignmentQuerySchema }), class_modules_controller_1.classModulesController.getAll);
/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: "Détail d'une affectation spécifique"
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
 *         description: Fiche détaillée de l'affectation (inclut profs, module, classe)
 */
router.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: class_modules_schema_1.assignmentParamsSchema }), class_modules_controller_1.classModulesController.getById);
/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: "Créer une nouvelle affectation (Admin+)"
 *     description: Lie une matière à une classe et optionnellement définit les professeurs.
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
 *               classId: { type: string, format: uuid, example: "uuid-class" }
 *               moduleId: { type: string, format: uuid, example: "uuid-module" }
 *               professorIds: { type: array, items: { type: string, format: uuid }, description: "Liste des profs enseignant ce module dans cette classe" }
 *     responses:
 *       201:
 *         description: Affectation créée avec succès
 */
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ body: class_modules_schema_1.createAssignmentSchema }), class_modules_controller_1.classModulesController.create);
/**
 * @swagger
 * /api/assignments/{id}:
 *   patch:
 *     summary: "Modifier une affectation (Mise à jour des professeurs)"
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
 *         description: Affectation mise à jour
 */
router.patch('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ params: class_modules_schema_1.assignmentParamsSchema, body: class_modules_schema_1.updateAssignmentSchema }), class_modules_controller_1.classModulesController.update);
/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: "Supprimer une affectation (ADMIN+)"
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
 *         description: Affectation supprimée définitivement
 */
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ params: class_modules_schema_1.assignmentParamsSchema }), class_modules_controller_1.classModulesController.remove);
//# sourceMappingURL=class-modules.route.js.map