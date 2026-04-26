"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.auditService = {
    /**
     * Enregistre une action dans les logs d'audit
     */
    async log(input, req) {
        try {
            await prisma_1.prisma.auditLog.create({
                data: {
                    schoolId: input.schoolId,
                    userId: input.userId,
                    action: input.action,
                    entity: input.entity,
                    entityId: input.entityId,
                    details: input.details,
                    ipAddress: req?.ip || null,
                    userAgent: req?.headers["user-agent"] || null,
                },
            });
        }
        catch (error) {
            console.error("❌ Failed to save audit log:", error);
            // On ne bloque pas l'action principale si l'audit échoue
        }
    },
    /**
     * Récupère les logs d'audit (Admin only)
     */
    async getLogs(schoolId, filters) {
        const limit = filters.limit || 50;
        const page = filters.page || 1;
        const skip = (page - 1) * limit;
        const where = {
            schoolId,
            ...(filters.userId && { userId: filters.userId }),
            ...(filters.action && { action: filters.action }),
            ...(filters.entity && { entity: filters.entity }),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip,
            }),
            prisma_1.prisma.auditLog.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
};
//# sourceMappingURL=audit.service.js.map