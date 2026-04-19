import { Role } from '@prisma/client';
export declare const professorsService: {
    getAll(schoolId: string, query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusId: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        /** Libellé UI : tous les campus de l’école si aucun campus assigné */
        campusScopeLabel: string | null;
    }>>;
    getById(id: string, schoolId: string): Promise<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusId: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        /** Libellé UI : tous les campus de l’école si aucun campus assigné */
        campusScopeLabel: string | null;
    }>;
    create(schoolId: string, data: {
        firstName: string;
        lastName: string;
        email: string;
        userId?: string;
        campusId?: string | null;
        matricule?: string | null;
        numero?: string | null;
        phone?: string | null;
    }): Promise<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusId: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        /** Libellé UI : tous les campus de l’école si aucun campus assigné */
        campusScopeLabel: string | null;
    }>;
    update(id: string, schoolId: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        userId?: string;
        campusId?: string | null;
        matricule?: string | null;
        numero?: string | null;
        phone?: string | null;
    }): Promise<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusId: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        /** Libellé UI : tous les campus de l’école si aucun campus assigné */
        campusScopeLabel: string | null;
    }>;
    delete(id: string, schoolId: string): Promise<void>;
    uploadAvatar(schoolId: string, professorId: string, file: Express.Multer.File, requester: {
        userId: string;
        role: Role;
    }): Promise<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusId: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        /** Libellé UI : tous les campus de l’école si aucun campus assigné */
        campusScopeLabel: string | null;
    }>;
    clearAvatar(schoolId: string, professorId: string, requester: {
        userId: string;
        role: Role;
    }): Promise<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusId: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        /** Libellé UI : tous les campus de l’école si aucun campus assigné */
        campusScopeLabel: string | null;
    }>;
};
//# sourceMappingURL=professors.service.d.ts.map