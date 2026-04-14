"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const auth_schema_1 = require("./auth.schema");
exports.authRouter = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: 1. Authentication
 *   description: Authentification et gestion de compte
 */
// ─── Public routes ────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscrire un nouvel étudiant
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
exports.authRouter.post('/register', (0, validate_middleware_1.validate)({ body: auth_schema_1.registerSchema }), auth_controller_1.authController.register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               email: { type: string, format: email, description: "Email de l'utilisateur" }
 *               matricule: { type: string, description: "Matricule (obligatoire si email absent)" }
 *               password: { type: string, example: "fadeldev" }
 *           examples:
 *             AdminAFI:
 *               summary: Login Admin via Matricule
 *               value:
 *                 matricule: "ADM-AFI-001"
 *                 password: "fadeldev"
 *             SuperAdmin:
 *               summary: Login SuperAdmin via Email
 *               value:
 *                 email: "superadmin@saas.com"
 *                 password: "fadeldev"
 *     responses:
 *       200:
 *         description: Login réussi, retourne un token JWT
 */
exports.authRouter.post('/login', (0, validate_middleware_1.validate)({ body: auth_schema_1.loginSchema }), auth_controller_1.authController.login);
exports.authRouter.post('/login/verify-otp', (0, validate_middleware_1.validate)({ body: auth_schema_1.verifyLoginOtpSchema }), auth_controller_1.authController.verifyLoginOtp);
exports.authRouter.post('/forgot-password', (0, validate_middleware_1.validate)({ body: auth_schema_1.forgotPasswordSchema }), auth_controller_1.authController.forgotPassword);
exports.authRouter.post('/reset-password', (0, validate_middleware_1.validate)({ body: auth_schema_1.resetPasswordSchema }), auth_controller_1.authController.resetPassword);
// ─── Protected routes ─────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [1. Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations du profil
 */
exports.authRouter.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.authController.me);
/**
 * @swagger
 * /api/auth/me:
 *   patch:
 *     summary: Mettre à jour le profil
 *     tags: [1. Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
exports.authRouter.patch('/me', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: auth_schema_1.updateProfileSchema }), auth_controller_1.authController.updateProfile);
/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Changer le mot de passe
 *     tags: [1. Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Mot de passe changé
 */
exports.authRouter.post('/change-password', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: auth_schema_1.changePasswordSchema }), auth_controller_1.authController.changePassword);
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir les tokens
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Nouveaux tokens générés
 */
exports.authRouter.post('/refresh', auth_controller_1.authController.refresh);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion (révoquer le refresh token)
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
exports.authRouter.post('/logout', auth_controller_1.authController.logout);
//# sourceMappingURL=auth.route.js.map