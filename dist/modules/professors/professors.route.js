"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorsRouter = void 0;
const express_1 = require("express");
const professors_controller_1 = require("./professors.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const profilePhotoUpload_middleware_1 = require("../../core/middleware/profilePhotoUpload.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const professors_schema_1 = require("./professors.schema");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.professorsRouter = router;
/**
 * @swagger
 * tags:
 *   name: Professors
 *   description: Gestion du corps enseignant et des affectations
 */
/**
 * @swagger
 * /api/professors:
 *   get:
 *     summary: "Liste des professeurs (Filtres)"
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
 *         description: Recherche par nom, email, matricule ou numéro interne
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée des professeurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: professors_schema_1.professorQuerySchema }), professors_controller_1.professorsController.getAll);
/**
 * @swagger
 * /api/professors/{id}/avatar:
 *   post:
 *     summary: "Photo de profil enseignant"
 *     description: "ADMIN/MANAGER ou enseignant lié au même compte (`userId`). Si un compte est lié, la photo est stockée sur le User."
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Fiche avec avatarUrl
 */
router.post('/:id/avatar', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: professors_schema_1.professorParamsSchema }), (req, res, next) => {
    profilePhotoUpload_middleware_1.profilePhotoUpload.single('file')(req, res, (err) => {
        if (err)
            return next(err);
        next();
    });
}, professors_controller_1.professorsController.uploadAvatar);
/**
 * @swagger
 * /api/professors/{id}/avatar:
 *   delete:
 *     summary: "Supprimer la photo de profil enseignant"
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/avatar', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: professors_schema_1.professorParamsSchema }), professors_controller_1.professorsController.clearAvatar);
/**
 * @swagger
 * /api/professors/{id}:
 *   get:
 *     summary: "Détail complet d'un professeur"
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Fiche détaillée du professeur
 */
router.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: professors_schema_1.professorParamsSchema }), professors_controller_1.professorsController.getById);
/**
 * @swagger
 * /api/professors:
 *   post:
 *     summary: "Créer un professeur (Admin/Manager)"
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email]
 *             properties:
 *               firstName: { type: string, example: "Moussa" }
 *               lastName: { type: string, example: "Faye" }
 *               email: { type: string, format: email, example: "moussa.faye@afi.com" }
 *               userId: { type: string, format: uuid, description: "Compte utilisateur existant à lier (optionnel)" }
 *               campusId: { type: string, format: uuid, nullable: true, description: "Absent ou null = accès à tous les campus (réponse campusAccess ALL, campusScopeLabel TOUS)" }
 *               matricule: { type: string }
 *               numero: { type: string, description: "Numéro interne / métier" }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: Professeur créé avec succès
 */
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ body: professors_schema_1.createProfessorSchema }), professors_controller_1.professorsController.create);
/**
 * @swagger
 * /api/professors/{id}:
 *   patch:
 *     summary: "Modifier la fiche d'un professeur"
 *     tags: [Professors]
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               userId: { type: string, format: uuid }
 *               campusId: { type: string, format: uuid, nullable: true }
 *               matricule: { type: string, nullable: true }
 *               numero: { type: string, nullable: true }
 *               phone: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Informations mises à jour
 */
router.patch('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ params: professors_schema_1.professorParamsSchema, body: professors_schema_1.updateProfessorSchema }), professors_controller_1.professorsController.update);
/**
 * @swagger
 * /api/professors/{id}:
 *   delete:
 *     summary: "Supprimer un professeur (ADMIN+)"
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Supprimé définitivement
 */
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ params: professors_schema_1.professorParamsSchema }), professors_controller_1.professorsController.remove);
//# sourceMappingURL=professors.route.js.map