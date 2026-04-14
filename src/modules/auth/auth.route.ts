import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  verifyLoginOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema';

export const authRouter = Router();

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
authRouter.post('/register', validate({ body: registerSchema }), authController.register);

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
authRouter.post('/login', validate({ body: loginSchema }), authController.login);

authRouter.post(
  '/login/verify-otp',
  validate({ body: verifyLoginOtpSchema }),
  authController.verifyLoginOtp
);

authRouter.post(
  '/forgot-password',
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

authRouter.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  authController.resetPassword
);

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
authRouter.get('/me', authMiddleware, authController.me);

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
authRouter.patch('/me', authMiddleware, validate({ body: updateProfileSchema }), authController.updateProfile);

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
authRouter.post(
  '/change-password',
  authMiddleware,
  validate({ body: changePasswordSchema }),
  authController.changePassword
);

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
authRouter.post('/refresh', authController.refresh);

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
authRouter.post('/logout', authController.logout);
