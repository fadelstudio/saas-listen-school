import { Request, Response, NextFunction } from "express";
import { auditService } from "./audit.service";
import { ForbiddenError } from "../../core/errors/AppError";

export const auditController = {
  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN") {
        throw new ForbiddenError("Accès réservé aux administrateurs");
      }

      const schoolId = req.schoolId!;
      const { userId, action, entity, page, limit } = req.query;

      const result = await auditService.getLogs(schoolId, {
        userId: userId as string,
        action: action as string,
        entity: entity as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 50,
      });

      res.sendSuccess("Audit logs fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },
};
