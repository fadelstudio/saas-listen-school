import { Role } from '@prisma/client';
export declare const professorsService: {
    getAll(schoolId: string, query: Record<string, unknown>, userRole?: string, userCampusIds?: string[]): Promise<import("../../utils/pagination").PaginatedResult<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusAccess: "ALL";
        campusScopeLabel: "TOUS";
    }>>;
    getById(id: string, schoolId: string, userRole?: string, userCampusIds?: string[]): Promise<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusAccess: "ALL";
        campusScopeLabel: "TOUS";
    }>;
    create(schoolId: string, data: {
        firstName: string;
        lastName: string;
        email: string;
        userId?: string;
        password?: string;
        matricule?: string | null;
        numero?: string | null;
        phone?: string | null;
    }, userRole?: string, _userCampusIds?: string[], requesterId?: string): Promise<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusAccess: "ALL";
        campusScopeLabel: "TOUS";
    }>;
    update(id: string, schoolId: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        userId?: string;
        matricule?: string | null;
        numero?: string | null;
        phone?: string | null;
    }, userRole?: string, userCampusIds?: string[], requesterId?: string): Promise<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusAccess: "ALL";
        campusScopeLabel: "TOUS";
    }>;
    delete(id: string, schoolId: string, userRole?: string, userCampusIds?: string[], requesterId?: string): Promise<void>;
    uploadAvatar(schoolId: string, professorId: string, file: Express.Multer.File, requester: {
        userId: string;
        role: Role;
    }): Promise<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusAccess: "ALL";
        campusScopeLabel: "TOUS";
    }>;
    clearAvatar(schoolId: string, professorId: string, requester: {
        userId: string;
        role: Role;
    }): Promise<{
        avatarUrl: string | null;
        linkedUserId: string | null;
        campusAccess: "ALL";
        campusScopeLabel: "TOUS";
    }>;
};
//# sourceMappingURL=professors.service.d.ts.map