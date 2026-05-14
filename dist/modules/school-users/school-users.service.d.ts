export declare const schoolUsersService: {
    create(adminUserId: string, input: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: "ADMIN" | "MANAGER" | "AGENT" | "VIEWER" | "STUDENT";
        matricule?: string;
        numero?: string;
        phone?: string;
        bio?: string;
        address?: string;
        campusIds?: string[];
        classId?: string;
        sex?: "MALE" | "FEMALE" | "UNDEFINED";
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        campuses: {
            id: string;
        }[];
        classId: string | null;
        matricule: string | null;
        numero: string | null;
        phone: string | null;
        bio: string | null;
        address: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        avatarPath: string | null;
        isActive: boolean;
    } & {
        avatarUrl: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        campusScopeLabel: string | null;
    }>;
    list(adminUserId: string, query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        email: string;
        id: string;
        createdAt: Date;
        phone: string | null;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        bio: string | null;
        address: string | null;
        avatarPath: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        classId: string | null;
        campuses: {
            id: string;
        }[];
    } & {
        avatarUrl: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        campusScopeLabel: string | null;
    }>>;
    listStaff(adminUserId: string, query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        email: string;
        id: string;
        createdAt: Date;
        phone: string | null;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        bio: string | null;
        address: string | null;
        avatarPath: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        classId: string | null;
        campuses: {
            id: string;
        }[];
    } & {
        avatarUrl: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        campusScopeLabel: string | null;
    }>>;
    listStudents(adminUserId: string, query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        email: string;
        id: string;
        createdAt: Date;
        phone: string | null;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        bio: string | null;
        address: string | null;
        avatarPath: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        classId: string | null;
        campuses: {
            id: string;
        }[];
    } & {
        avatarUrl: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        campusScopeLabel: string | null;
    }>>;
    update(adminUserId: string, targetId: string, input: {
        role?: "ADMIN" | "MANAGER" | "AGENT" | "VIEWER" | "STUDENT";
        isActive?: boolean;
        classId?: string | null;
        campusIds?: string[];
        firstName?: string;
        lastName?: string;
        matricule?: string | null;
        numero?: string | null;
        phone?: string | null;
        bio?: string | null;
        address?: string | null;
        email?: string;
        sex?: "MALE" | "FEMALE" | "UNDEFINED";
    }): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        classId: string | null;
        campuses: {
            id: string;
        }[];
    }>;
    getById(adminUserId: string, targetId: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string | null;
        phone: string | null;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        bio: string | null;
        address: string | null;
        avatarPath: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        emailVerified: boolean;
        classId: string | null;
        campuses: {
            id: string;
        }[];
    } & {
        avatarUrl: string | null;
        campusAccess: "ALL" | "RESTRICTED";
        campusScopeLabel: string | null;
    }>;
    resetPasswordToDefault(adminUserId: string, targetId: string): Promise<{
        message: string;
    }>;
    delete(adminUserId: string, targetId: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string | null;
        phone: string | null;
        passwordHash: string | null;
        googleId: string | null;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        bio: string | null;
        address: string | null;
        avatarPath: string | null;
        sex: import("@prisma/client").$Enums.Sex;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        fcmToken: string | null;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        currentSessionId: string | null;
        classId: string | null;
    }>;
};
//# sourceMappingURL=school-users.service.d.ts.map