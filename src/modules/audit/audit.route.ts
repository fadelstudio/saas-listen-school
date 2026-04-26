import { Router } from "express";
import { auditController } from "./audit.controller";
import { authenticate, authorize } from "../../core/middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /audit/logs:
 *   get:
 *     summary: Récupère les logs d'audit (Admin+)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 */
router.get("/logs", authenticate, authorize("ADMIN", "SUPERADMIN"), auditController.getLogs);

export default router;
