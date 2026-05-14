"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementsRouter = void 0;
const express_1 = require("express");
const announcements_controller_1 = require("./announcements.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const announcements_schema_1 = require("./announcements.schema");
exports.announcementsRouter = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: Gestion des annonces (PUB)
 */
exports.announcementsRouter.get('/active', announcements_controller_1.announcementsController.getActive);
exports.announcementsRouter.get('/', auth_middleware_1.authMiddleware, announcements_controller_1.announcementsController.getAll);
exports.announcementsRouter.post('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: announcements_schema_1.createAnnouncementSchema }), announcements_controller_1.announcementsController.create);
exports.announcementsRouter.patch('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: announcements_schema_1.announcementParamsSchema, body: announcements_schema_1.updateAnnouncementSchema }), announcements_controller_1.announcementsController.update);
exports.announcementsRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: announcements_schema_1.announcementParamsSchema }), announcements_controller_1.announcementsController.remove);
//# sourceMappingURL=announcements.route.js.map