"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.academicModulesRouter = void 0;
const express_1 = require("express");
const academic_modules_controller_1 = require("./academic-modules.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const academic_modules_schema_1 = require("./academic-modules.schema");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.academicModulesRouter = router;
/**
 * @swagger
 * tags:
 *   name: Academic Modules
 *   description: Gestion des matières et unités d'enseignement (Matières académiques)
 */
/**
 * @swagger
 * /api/academic-modules:
 *   get:
 *     summary: "Liste de toutes les matières académiques"
 *     tags: [Academic Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         description: Recherche par nom ou code de matière
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée des matières
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: academic_modules_schema_1.academicModuleQuerySchema }), academic_modules_controller_1.academicModulesController.getAll);
/**
 * @swagger
 * /api/academic-modules/{id}:
 *   get:
 *     summary: "Détail d'une matière académique"
 *     tags: [Academic Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Fiche détaillée de la matière
 */
router.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: academic_modules_schema_1.academicModuleParamsSchema }), academic_modules_controller_1.academicModulesController.getById);
/**
 * @swagger
 * /api/academic-modules:
 *   post:
 *     summary: "Créer une nouvelle matière (Admin+)"
 *     tags: [Academic Modules]
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
 *               name: { type: string, example: "Algorithmique Avancée" }
 *               code: { type: string, example: "ALGO-301" }
 *     responses:
 *       201:
 *         description: Matière créée avec succès
 */
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ body: academic_modules_schema_1.createAcademicModuleSchema }), academic_modules_controller_1.academicModulesController.create);
/**
 * @swagger
 * /api/academic-modules/{id}:
 *   patch:
 *     summary: "Modifier une matière académique"
 *     tags: [Academic Modules]
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
 *               code: { type: string }
 *     responses:
 *       200:
 *         description: Informations mises à jour
 */
router.patch('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ params: academic_modules_schema_1.academicModuleParamsSchema, body: academic_modules_schema_1.updateAcademicModuleSchema }), academic_modules_controller_1.academicModulesController.update);
/**
 * @swagger
 * /api/academic-modules/{id}:
 *   delete:
 *     summary: "Supprimer une matière (ADMIN+)"
 *     tags: [Academic Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Supprimée définitivement
 */
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ params: academic_modules_schema_1.academicModuleParamsSchema }), academic_modules_controller_1.academicModulesController.remove);
//# sourceMappingURL=academic-modules.route.js.map