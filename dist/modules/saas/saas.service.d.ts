import { CreateSchoolInput } from './saas.schema';
export declare const saasService: {
    createSchool(input: CreateSchoolInput): Promise<{
        campus: {
            name: string;
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    listSchools(): Promise<({
        _count: {
            users: number;
            classes: number;
        };
    } & {
        name: string;
        id: string;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getSchoolById(id: string): Promise<{
        _count: {
            users: number;
            classes: number;
            professors: number;
        };
    } & {
        name: string;
        id: string;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateSchool(id: string, data: {
        name?: string;
        location?: string;
    }): Promise<{
        name: string;
        id: string;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
//# sourceMappingURL=saas.service.d.ts.map