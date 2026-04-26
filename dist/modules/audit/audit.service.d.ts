import { Request } from "express";
export interface AuditInput {
    action: string;
    entity: string;
    entityId?: string;
    details?: any;
    userId?: string;
    schoolId: string;
}
export declare const auditService: {
    /**
     * Enregistre une action dans les logs d'audit
     */
    log(input: AuditInput, req?: Request): Promise<void>;
    /**
     * Récupère les logs d'audit (Admin only)
     */
    getLogs(schoolId: string, filters: {
        userId?: string;
        action?: string;
        entity?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        items: ({
            user: {
                firstName: string;
                lastName: string;
                role: import("@prisma/client").$Enums.Role;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            schoolId: string;
            userId: string | null;
            action: string;
            entity: string;
            entityId: string | null;
            details: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
};
//# sourceMappingURL=audit.service.d.ts.map