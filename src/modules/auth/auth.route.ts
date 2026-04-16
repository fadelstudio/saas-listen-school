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
  resendOtpSchema,
} from './auth.schema';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification, Inscription (Étudiants) et gestion de compte (Profil, Mot de passe)
 */

// ─── Public routes ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: "Inscription d'un nouvel Étudiant"
 *     description: Permet l'auto-inscription. Si le SaaS le requiert, un OTP sera envoyé par email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email, example: "etudiant@afi.com" }
 *               password: { type: string, minLength: 8, example: "monMdpSecret123" }
 *               firstName: { type: string, example: "Mamadou" }
 *               lastName: { type: string, example: "Niane" }
 *     responses:
 *       201:
 *         description: Créé. Retourne un challengeId s'il faut valider l'OTP.
 *       200:
 *         description: Connecté direct (si OTP désactivé)
 */
authRouter.post('/register', validate({ body: registerSchema }), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: "Connexion (Email ou Matricule)"
 *     description: Identifie l'utilisateur via son email ou son matricule unique.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               email: { type: string, format: email, description: "Email de l'utilisateur" }
 *               matricule: { type: string, description: "Matricule (pour les membres du staff)" }
 *               password: { type: string, example: "fadeldev" }
 *           examples:
 *             AdminAFI:
 *               summary: Connexion Administrateur (Matricule)
 *               value:
 *                 matricule: "ADM-AFI-001"
 *                 password: "fadeldev"
 *             Etudiant:
 *               summary: Connexion Étudiant (Email)
 *               value:
 *                 email: "etudiant@afi.com"
 *                 password: "fadeldev"
 *     responses:
 *       200:
 *         description: Authentification réussie. Retourne l'AccessToken et le RefreshToken.
 */
authRouter.post('/login', validate({ body: loginSchema }), authController.login);

/**
 * @swagger
 * /api/auth/login/verify-otp:
 *   post:
 *     summary: "Valider l'inscription par OTP"
 *     description: Nécessaire uniquement lors du flux d'inscription si l'OTP est activé.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [challengeId, otp]
 *             properties:
 *               challengeId: { type: string, format: uuid }
 *               otp: { type: string, example: "123456", description: "Code à 6 chiffres" }
 *     responses:
 *       200:
 *         description: Validation réussie, tokens générés.
 */
authRouter.post(
  '/login/verify-otp',
  validate({ body: verifyLoginOtpSchema }),
  authController.verifyLoginOtp
);

/**
 * @swagger
 * /api/auth/login/resend-otp:
 *   post:
 *     summary: "Renvoyer un code de validation"
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [challengeId]
 *             properties:
 *               challengeId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Code renvoyé par email.
 */
authRouter.post(
  '/login/resend-otp',
  validate({ body: resendOtpSchema }),
  authController.resendOtp
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: "Mot de passe oublié"
 *     description: Envoie un lien de réinitialisation sécurisé par email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "etudiant@afi.com" }
 *     responses:
 *       200:
 *         description: Instruction envoyée (toujours retourner 200 pour éviter l'énumération d'utilisateurs).
 */
authRouter.post(
  '/forgot-password',
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: "Réinitialiser avec un token"
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string, description: "Token reçu par email" }
 *               newPassword: { type: string, minLength: 8, example: "NouveauMdp123!" }
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour.
 */
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
 *     summary: "Profil de l'utilisateur connecté"
 *     description: Récupère les infos, le rôle et le campus de l'utilisateur porteur du token.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données utilisateur.
 */
authRouter.get('/me', authMiddleware, authController.me);

/**
 * @swagger
 * /api/auth/me:
 *   patch:
 *     summary: "Mettre à jour ses informations personnelles"
 *     tags: [Auth]
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
 *         description: Profil mis à jour.
 */
authRouter.patch('/me', authMiddleware, validate({ body: updateProfileSchema }), authController.updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: "Changer son mot de passe (En étant connecté)"
 *     tags: [Auth]
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
 *         description: Réussi. Les autres sessions sont maintenues.
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
 *     summary: "Obtenir un nouvel AccessToken"
 *     description: Utilise le RefreshToken pour prolonger la session.
 *     tags: [Auth]
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
 *         description: Nouveaux tokens.
 */
authRouter.post('/refresh', authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: "Déconnexion (Révocation)"
 *     description: Invalide le RefreshToken pour empêcher toute nouvelle génération d'access token.
 *     tags: [Auth]
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
 *         description: Déconnexion réussie.
 */
authRouter.post('/logout', authController.logout);
