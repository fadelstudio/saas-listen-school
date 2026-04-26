"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("./audit.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /audit/logs:
 *   get:
 *     summary: Récupère les logs d'audit (Admin+)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 */
router.get("/logs", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN", "SUPERADMIN"), audit_controller_1.auditController.getLogs);
exports.default = router;
//# sourceMappingURL=audit.route.js.map