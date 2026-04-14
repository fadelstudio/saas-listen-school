"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolUsersRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const school_users_schema_1 = require("./school-users.schema");
const school_users_controller_1 = require("./school-users.controller");
exports.schoolUsersRouter = (0, express_1.Router)();
exports.schoolUsersRouter.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * tags:
 *   name: School users
 *   description: Gestion des comptes par l'administrateur d'école (ADMIN)
 */
/**
 * @swagger
 * /api/school-users:
 *   post:
 *     summary: Créer un utilisateur (MANAGER, AGENT, VIEWER, STUDENT)
 *     tags: [School users]
 *     security:
 *       - bearerAuth: []
 */
exports.schoolUsersRouter.post('/', (0, validate_middleware_1.validate)({ body: school_users_schema_1.createSchoolUserSchema }), school_users_controller_1.schoolUsersController.create);
/**
 * @swagger
 * /api/school-users:
 *   get:
 *     summary: Lister les utilisateurs du campus
 *     tags: [School users]
 *     security:
 *       - bearerAuth: []
 */
exports.schoolUsersRouter.get('/', (0, validate_middleware_1.validate)({ query: school_users_schema_1.schoolUserQuerySchema }), school_users_controller_1.schoolUsersController.list);
/**
 * @swagger
 * /api/school-users/{id}:
 *   patch:
 *     summary: Mettre à jour rôle, statut ou classe
 *     tags: [School users]
 *     security:
 *       - bearerAuth: []
 */
exports.schoolUsersRouter.patch('/:id', (0, validate_middleware_1.validate)({ params: school_users_schema_1.schoolUserParamsSchema, body: school_users_schema_1.updateSchoolUserSchema }), school_users_controller_1.schoolUsersController.update);
//# sourceMappingURL=school-users.route.js.map