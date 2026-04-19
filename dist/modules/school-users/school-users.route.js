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
 *   name: School Users
 *   description: Gestion des comptes par l'administrateur d'école (ADMIN)
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     SchoolUser:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         email: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         role: { type: string, enum: [ADMIN, MANAGER, AGENT, VIEWER, STUDENT] }
 *         isActive: { type: boolean }
 *         matricule: { type: string, nullable: true }
 *         numero: { type: string, nullable: true }
 *         phone: { type: string, nullable: true }
 *         campusAccess: { type: string, enum: [ALL, RESTRICTED], description: "ALL si campusId null (toute l'école)" }
 *         campusScopeLabel: { type: string, nullable: true, example: "TOUS" }
 *         avatarUrl: { type: string, nullable: true, description: "URL signée photo de profil" }
 *         classId: { type: string, format: uuid, nullable: true }
 *         createdAt: { type: string, format: date-time }
 */
/**
 * @swagger
 * /api/school-users/staff:
 *   get:
 *     summary: "[ADMIN+] Lister le personnel administratif"
 *     description: Récupère uniquement les utilisateurs avec les rôles ADMIN, MANAGER, AGENT ou VIEWER.
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, MANAGER, AGENT, VIEWER] }
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste du personnel récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SchoolUser' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
exports.schoolUsersRouter.get('/staff', (0, validate_middleware_1.validate)({ query: school_users_schema_1.schoolUserQuerySchema }), school_users_controller_1.schoolUsersController.listStaff);
/**
 * @swagger
 * /api/school-users/students:
 *   get:
 *     summary: "[MANAGER+] Lister les étudiants"
 *     description: Récupère uniquement les utilisateurs avec le rôle STUDENT.
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste des étudiants récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SchoolUser' }
 */
exports.schoolUsersRouter.get('/students', (0, validate_middleware_1.validate)({ query: school_users_schema_1.schoolUserQuerySchema }), school_users_controller_1.schoolUsersController.listStudents);
/**
 * @swagger
 * /api/school-users/{id}/reset-password-default:
 *   post:
 *     summary: "[ADMIN+] Réinitialiser le mot de passe au défaut serveur"
 *     description: |
 *       Applique le mot de passe défini par `DEFAULT_PASSWORD_RESET` (fichier d’environnement),
 *       révoque les refresh tokens et les jetons OTP / reset email en cours.
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé
 */
exports.schoolUsersRouter.post('/:id/reset-password-default', (0, validate_middleware_1.validate)({ params: school_users_schema_1.schoolUserParamsSchema }), school_users_controller_1.schoolUsersController.resetPasswordToDefault);
/**
 * @swagger
 * /api/school-users/{id}:
 *   get:
 *     summary: Récupérer le détail d'un utilisateur
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolUser'
 */
exports.schoolUsersRouter.get('/:id', (0, validate_middleware_1.validate)({ params: school_users_schema_1.schoolUserParamsSchema }), school_users_controller_1.schoolUsersController.getById);
/**
 * @swagger
 * /api/school-users:
 *   post:
 *     summary: Créer un utilisateur (Par ADMIN campus)
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, firstName, lastName, role, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8, example: "Password123!" }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               role: { type: string, enum: [MANAGER, AGENT, VIEWER, STUDENT] }
 *               matricule: { type: string }
 *               numero: { type: string }
 *               phone: { type: string }
 *               campusId: { type: string, format: uuid, description: "Optionnel ; sans campus ni classe → accès toute l'école (campusId null)" }
 *               classId: { type: string, format: uuid, description: "Obligatoire si STUDENT" }
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
exports.schoolUsersRouter.post('/', (0, validate_middleware_1.validate)({ body: school_users_schema_1.createSchoolUserSchema }), school_users_controller_1.schoolUsersController.create);
/**
 * @swagger
 * /api/school-users:
 *   get:
 *     summary: Lister TOUS les utilisateurs (Filtres globaux)
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, MANAGER, AGENT, VIEWER, STUDENT] }
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste filtrée
 */
exports.schoolUsersRouter.get('/', (0, validate_middleware_1.validate)({ query: school_users_schema_1.schoolUserQuerySchema }), school_users_controller_1.schoolUsersController.list);
/**
 * @swagger
 * /api/school-users/{id}:
 *   patch:
 *     summary: Mettre à jour un compte utilisateur
 *     tags: [School Users]
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
 *               role: { type: string, enum: [ADMIN, MANAGER, AGENT, VIEWER, STUDENT] }
 *               isActive: { type: boolean }
 *               classId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 */
exports.schoolUsersRouter.patch('/:id', (0, validate_middleware_1.validate)({ params: school_users_schema_1.schoolUserParamsSchema, body: school_users_schema_1.updateSchoolUserSchema }), school_users_controller_1.schoolUsersController.update);
/**
 * @swagger
 * /api/school-users/{id}:
 *   delete:
 *     summary: Supprimer un compte
 *     tags: [School Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
exports.schoolUsersRouter.delete('/:id', (0, validate_middleware_1.validate)({ params: school_users_schema_1.schoolUserParamsSchema }), school_users_controller_1.schoolUsersController.delete);
//# sourceMappingURL=school-users.route.js.map