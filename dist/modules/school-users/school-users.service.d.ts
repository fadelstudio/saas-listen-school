export declare const schoolUsersService: {
    create(adminUserId: string, input: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: "MANAGER" | "AGENT" | "VIEWER" | "STUDENT";
        matricule?: string;
        classId?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        campusId: string | null;
        classId: string | null;
        matricule: string | null;
        isActive: boolean;
    }>;
    list(adminUserId: string, query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        id: string;
        createdAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        classId: string | null;
    }>>;
    update(adminUserId: string, targetId: string, input: {
        role?: "MANAGER" | "AGENT" | "VIEWER" | "STUDENT";
        isActive?: boolean;
        classId?: string | null;
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        classId: string | null;
    }>;
    getById(adminUserId: string, targetId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        classId: string | null;
    }>;
    delete(adminUserId: string, targetId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        classId: string | null;
    }>;
};
//# sourceMappingURL=school-users.service.d.ts.map