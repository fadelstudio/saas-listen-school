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
 * components:
 *   schemas:
 *     CreateSchoolInput:
 *       type: object
 *       required: [name, adminEmail, adminPassword, adminFirstName, adminLastName]
 *       properties:
 *         name: { type: string, example: "AFI Dakar" }
 *         location: { type: string, example: "Dakar, Plateau" }
 *         adminEmail: { type: string, format: email, example: "admin@afi.com" }
 *         adminPassword: { type: string, minLength: 8, example: "fadeldev" }
 *         adminFirstName: { type: string, example: "Jean" }
 *         adminLastName: { type: string, example: "Dupont" }
 *         matricule: { type: string, example: "ADM-AFI-001" }
 */
/**
 * @swagger
 * /api/saas/schools:
 *   post:
 *     summary: "[SUPERADMIN] Créer une nouvelle école (Campus + Premier Admin)"
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
 *         description: École et admin créés avec succès
 */
saasRouter.post('/schools', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.SUPERADMIN), (0, validate_middleware_1.validate)({ body: saas_schema_1.createSchoolSchema }), saas_controller_1.saasController.createSchool);
exports.default = saasRouter;
//# sourceMappingURL=saas.route.js.map