import { CreateSchoolInput } from './saas.schema';
import { Prisma } from '@prisma/client';
export declare const saasService: {
    createSchool(input: CreateSchoolInput): Promise<{
        school: {
            name: string;
            id: string;
            domain: string | null;
            logoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        campus: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
        };
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    listSchools(): Promise<({
        _count: {
            users: number;
        };
        campuses: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
        }[];
    } & {
        name: string;
        id: string;
        domain: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getSchoolById(id: string): Promise<{
        campuses: ({
            _count: {
                classes: number;
                users: number;
                professors: number;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
        })[];
        settings: {
            id: string;
            updatedAt: Date;
            schoolId: string;
            schoolName: string;
            authReportsRequired: boolean;
            authEvaluationsRequired: boolean;
            authOtpRequired: boolean;
            aiEnabled: boolean;
            aiConfigs: Prisma.JsonValue;
            aiOverrideConfigId: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        domain: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateSchool(id: string, data: {
        name?: string;
        domain?: string;
        logoUrl?: string;
    }): Promise<{
        name: string;
        id: string;
        domain: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createCampus(schoolId: string, data: {
        name: string;
        location?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        location: string | null;
    }>;
};
//# sourceMappingURL=saas.service.d.ts.map