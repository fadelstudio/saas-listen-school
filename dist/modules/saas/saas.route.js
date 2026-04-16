"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const saas_controller_1 = require("./saas.controller");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const saas_schema_1 = require("./saas.schema");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const client_1 = require("@prisma/client");
const saasRouter = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: SaaS
 *   description: Gestion multi-tenant des écoles et des campus (SUPERADMIN uniquement)
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSchoolInput:
 *       type: object
 *       required: [name, adminEmail, adminPassword, adminFirstName, adminLastName]
 *       properties:
 *         name: { type: string, example: "Groupe AFI - Dakar" }
 *         location: { type: string, example: "Point E, Dakar" }
 *         adminEmail: { type: string, format: email, example: "admin.afi@groupes.com" }
 *         adminPassword: { type: string, minLength: 8, example: "AFI_Admin_2026!" }
 *         adminFirstName: { type: string, example: "Adama" }
 *         adminLastName: { type: string, example: "Diop" }
 *         matricule: { type: string, example: "ADM-AFI-01" }
 */
/**
 * @swagger
 * /api/saas/schools:
 *   post:
 *     summary: "[SUPERADMIN] Créer une nouvelle école (Tenant)"
 *     description: Initialise un nouveau campus et crée le premier compte Administrateur pour ce campus.
 *     tags: [SaaS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolInput'
 *     responses:
 *       201:
 *         description: École (Campus) créée avec son administrateur référent.
 */
saasRouter.post('/schools', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.SUPERADMIN), (0, validate_middleware_1.validate)({ body: saas_schema_1.createSchoolSchema }), saas_controller_1.saasController.createSchool);
/**
 * @swagger
 * /api/saas/schools:
 *   get:
 *     summary: "[SUPERADMIN] Liste des écoles"
 *     tags: [SaaS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste exhaustive des tenants (Écoles)
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
 *                       name: { type: string }
 *                       campuses: { type: array, items: { type: object } }
 *                       _count: { type: object }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
saasRouter.get('/schools', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.SUPERADMIN), saas_controller_1.saasController.listSchools);
/**
 * @swagger
 * /api/saas/schools/{id}:
 *   get:
 *     summary: "[SUPERADMIN] Détails d'une école"
 *     tags: [SaaS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Fiche technique du campus
 *       404:
 *         description: École non trouvée
 */
saasRouter.get('/schools/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.SUPERADMIN), (0, validate_middleware_1.validate)({ params: saas_schema_1.schoolParamsSchema }), saas_controller_1.saasController.getById);
/**
 * @swagger
 * /api/saas/schools/{id}:
 *   patch:
 *     summary: "[SUPERADMIN] Modifier les métadonnées d'une école"
 *     tags: [SaaS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "AFI Université Internationale" }
 *               location: { type: string, example: "Dakar Plateau, Immeuble AFI" }
 *     responses:
 *       200:
 *         description: Modifications appliquées
 */
saasRouter.patch('/schools/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.SUPERADMIN), (0, validate_middleware_1.validate)({ params: saas_schema_1.schoolParamsSchema, body: saas_schema_1.updateSchoolSchema }), saas_controller_1.saasController.update);
/**
 * @swagger
 * /api/saas/schools/{id}/campuses:
 *   post:
 *     summary: "[SUPERADMIN] Ajouter un campus à une école"
 *     tags: [SaaS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Campus Nord" }
 *               location: { type: string, example: "Saint-Louis, Sénégal" }
 *     responses:
 *       201:
 *         description: Campus ajouté
 */
saasRouter.post('/schools/:id/campuses', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.SUPERADMIN), saas_controller_1.saasController.createCampus);
exports.default = saasRouter;
//# sourceMappingURL=saas.route.js.map