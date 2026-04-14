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
};
//# sourceMappingURL=saas.service.d.ts.map