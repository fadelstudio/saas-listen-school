"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const profilePhotoUpload_middleware_1 = require("../../core/middleware/profilePhotoUpload.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const auth_schema_1 = require("./auth.schema");
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
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
 *     description: Permet l'auto-inscription dans l'école résolue par sous-domaine (ou header x-school-slug en fallback). Si le SaaS le requiert, un OTP sera envoyé par email.
 *     tags: [Auth]
 *     parameters:
 *       - $ref: '#/components/parameters/SchoolSlugHeader'
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
 *               campusId: { type: string, format: uuid, example: "uuid-du-campus", description: "ID du campus (optionnel si classId fourni)" }
 *               classId: { type: string, format: uuid, example: "uuid-de-la-classe", description: "ID de la classe de l'étudiant" }
 *     responses:
 *       201:
 *         description: Créé. Retourne un challengeId s'il faut valider l'OTP.
 *       200:
 *         description: Connecté direct (si OTP désactivé)
 */
authRouter.post('/register', (0, validate_middleware_1.validate)({ body: auth_schema_1.registerSchema }), auth_controller_1.authController.register);
/**
 * @swagger
 * /api/auth/register/verify-otp:
 *   post:
 *     summary: "Valider l'OTP d'inscription"
 *     description: Finalise l'inscription quand `/register` retourne `REGISTER_OTP_REQUIRED`. Renvoie la réponse de login normale (tokens + user).
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
 *               otp: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Inscription validée + tokens
 */
authRouter.post('/register/verify-otp', (0, validate_middleware_1.validate)({ body: auth_schema_1.verifyLoginOtpSchema }), auth_controller_1.authController.verifyRegisterOtp);
/**
 * @swagger
 * /api/auth/register/verify-link:
 *   get:
 *     summary: "Vérification un-clic par lien"
 *     description: Permet de vérifier l'email en cliquant directement sur le lien reçu. Redirige vers le site web.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       302:
 *         description: Redirection vers verify-success ou verify-error.
 */
authRouter.get('/register/verify-link', auth_controller_1.authController.verifyRegisterLink);
/**
 * @swagger
 * /api/auth/register/resend-otp:
 *   post:
 *     summary: "Renvoyer l'OTP d'inscription"
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
authRouter.post('/register/resend-otp', (0, validate_middleware_1.validate)({ body: auth_schema_1.resendOtpSchema }), auth_controller_1.authController.resendOtp);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: "Connexion (Email ou Matricule)"
 *     description: Identifie l'utilisateur via son email ou son matricule dans l'école résolue (sous-domaine principal, x-school-slug fallback). Retourne directement les tokens (OTP non requis au login).
 *     tags: [Auth]
 *     parameters:
 *       - $ref: '#/components/parameters/SchoolSlugHeader'
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
authRouter.post('/login', (0, validate_middleware_1.validate)({ body: auth_schema_1.loginSchema }), auth_controller_1.authController.login);
/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: "Connexion / inscription Google (étape 1)"
 *     description: >
 *       Vérifie le `id_token` Google. Si le compte existe et est complet, renvoie les tokens.
 *       Sinon renvoie `GOOGLE_SELECT_CLASS` avec un `pendingToken` à utiliser sur `/api/auth/google/complete`
 *       après choix campus/classe. Nécessite `GOOGLE_OAUTH_CLIENT_IDS` côté serveur.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken: { type: string, description: "id_token JWT retourné par Google Sign-In" }
 *     responses:
 *       200:
 *         description: Tokens ou étape GOOGLE_SELECT_CLASS
 */
authRouter.post('/google', (0, validate_middleware_1.validate)({ body: auth_schema_1.googleAuthStartSchema }), auth_controller_1.authController.googleStart);
/**
 * @swagger
 * /api/auth/google/complete:
 *   post:
 *     summary: "Finaliser Google après choix de la classe"
 *     description: Consomme `pendingToken` (15 min) + `classId` / `campusId` optionnel. Crée le compte étudiant ou complète un étudiant sans classe.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pendingToken, classId]
 *             properties:
 *               pendingToken: { type: string }
 *               classId: { type: string, format: uuid }
 *               campusId: { type: string, format: uuid, description: "Optionnel ; doit correspondre au campus de la classe" }
 *     responses:
 *       200:
 *         description: Session ou OTP d'inscription
 *       201:
 *         description: Compte créé avec OTP requis
 */
authRouter.post('/google/complete', (0, validate_middleware_1.validate)({ body: auth_schema_1.googleAuthCompleteSchema }), auth_controller_1.authController.googleComplete);
/**
 * @swagger
 * /api/auth/login/verify-otp:
 *   post:
 *     summary: "[DEPRECATED] Valider un OTP"
 *     description: Compatibilité legacy. Utiliser `/api/auth/register/verify-otp` pour le flux OTP d'inscription.
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
// Deprecated: OTP is registration-only. Kept for backward compatibility.
authRouter.post('/login/verify-otp', (0, validate_middleware_1.validate)({ body: auth_schema_1.verifyLoginOtpSchema }), auth_controller_1.authController.verifyRegisterOtp);
/**
 * @swagger
 * /api/auth/login/resend-otp:
 *   post:
 *     summary: "[DEPRECATED] Renvoyer un OTP"
 *     description: Compatibilité legacy. Utiliser `/api/auth/register/resend-otp`.
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
// Deprecated: OTP is registration-only. Kept for backward compatibility.
authRouter.post('/login/resend-otp', (0, validate_middleware_1.validate)({ body: auth_schema_1.resendOtpSchema }), auth_controller_1.authController.resendOtp);
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
authRouter.post('/forgot-password', (0, validate_middleware_1.validate)({ body: auth_schema_1.forgotPasswordSchema }), auth_controller_1.authController.forgotPassword);
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
 *             required: [token, newPassword, confirmPassword]
 *             properties:
 *               token: { type: string, description: "Token reçu par email" }
 *               newPassword: { type: string, minLength: 8, example: "NouveauMdp123!" }
 *               confirmPassword: { type: string, minLength: 8, example: "NouveauMdp123!" }
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour.
 */
authRouter.post('/reset-password', (0, validate_middleware_1.validate)({ body: auth_schema_1.resetPasswordSchema }), auth_controller_1.authController.resetPassword);
// ─── Protected routes ─────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: "Profil de l'utilisateur connecté"
 *     description: "Infos, rôle, campus ; `avatarUrl` est une URL signée Supabase (durée limitée, voir SIGNED_URL_EXPIRES_IN)."
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données utilisateur.
 */
authRouter.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.authController.me);
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
 *               matricule: { type: string, nullable: true, description: "Doit rester unique dans la base" }
 *               numero: { type: string, nullable: true }
 *               phone: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Profil mis à jour.
 */
authRouter.patch('/me', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: auth_schema_1.updateProfileSchema }), auth_controller_1.authController.updateProfile);
/**
 * @swagger
 * /api/auth/me/avatar:
 *   post:
 *     summary: "Télécharger sa photo de profil"
 *     description: "JPEG, PNG ou WebP. Stockage Supabase ; la réponse inclut `avatarUrl` (URL signée)."
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profil mis à jour avec avatarUrl
 */
authRouter.post('/me/avatar', auth_middleware_1.authMiddleware, (req, res, next) => {
    profilePhotoUpload_middleware_1.profilePhotoUpload.single('file')(req, res, (err) => {
        if (err)
            return next(err);
        next();
    });
}, auth_controller_1.authController.uploadAvatar);
/**
 * @swagger
 * /api/auth/me/avatar:
 *   delete:
 *     summary: "Supprimer sa photo de profil"
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Photo retirée
 */
authRouter.delete('/me/avatar', auth_middleware_1.authMiddleware, auth_controller_1.authController.clearAvatar);
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
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *               confirmPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Réussi. Les autres sessions sont maintenues.
 */
authRouter.post('/change-password', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: auth_schema_1.changePasswordSchema }), auth_controller_1.authController.changePassword);
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
authRouter.post('/refresh', auth_controller_1.authController.refresh);
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
authRouter.post('/logout', auth_controller_1.authController.logout);
/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: "Renvoyer l'email de vérification (Utilisateur connecté)"
 *     description: Déclenche l'envoi d'un nouvel OTP pour un utilisateur dont l'email n'est pas encore vérifié.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email envoyé.
 */
authRouter.post('/resend-verification', auth_middleware_1.authMiddleware, auth_controller_1.authController.resendVerification);
//# sourceMappingURL=auth.route.js.map