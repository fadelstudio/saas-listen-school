import { AcademicModuleFilters } from './academic-modules.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const academicModulesRepository: {
    findAll(filters: AcademicModuleFilters, pagination: PaginationArgs): Promise<{
        items: ({
            _count: {
                reports: number;
                evaluations: number;
                classModules: number;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
        evaluations: ({
            evaluator: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string | null;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                matricule: string | null;
                role: import("@prisma/client").$Enums.Role;
                isActive: boolean;
                fcmToken: string | null;
                emailVerified: boolean;
                emailVerifiedAt: Date | null;
                campusId: string | null;
                classId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            classId: string;
            status: import("@prisma/client").$Enums.EvaluationStatus;
            isAnonymous: boolean;
            professorId: string;
            moduleId: string;
            reportId: string | null;
            evaluatorId: string | null;
            score: number | null;
            comprehensionRating: import("@prisma/client").$Enums.RatingBand | null;
            explanationRating: import("@prisma/client").$Enums.RatingBand | null;
            pedagogyRating: import("@prisma/client").$Enums.RatingBand | null;
            availabilityRating: import("@prisma/client").$Enums.RatingBand | null;
            rhythmRating: import("@prisma/client").$Enums.RatingBand | null;
            comment: string | null;
            aiScore: number | null;
            campaignId: string | null;
        })[];
        classModules: ({
            professors: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                firstName: string;
                lastName: string;
                campusId: string | null;
                userId: string | null;
            }[];
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                campusId: string;
                levelId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            moduleId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }) | null>;
    create(data: {
        name: string;
        code?: string;
    }): Promise<{
        _count: {
            classModules: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }>;
    update(id: string, data: {
        name?: string;
        code?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }>;
};
export {};
//# sourceMappingURL=academic-modules.repository.d.ts.map