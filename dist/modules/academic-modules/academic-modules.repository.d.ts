import { Prisma } from '@prisma/client';
import { AcademicModuleFilters } from './academic-modules.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const academicModulesRepository: {
    findAll(schoolId: string, filters: AcademicModuleFilters, pagination: PaginationArgs): Promise<{
        items: ({
            _count: {
                reports: number;
                evaluations: number;
                classModules: number;
            };
        } & {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        })[];
        total: number;
    }>;
    findById(id: string, schoolId: string): Promise<({
        evaluations: ({
            evaluator: {
                email: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string | null;
                phone: string | null;
                passwordHash: string;
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
            deviceMetadata: Prisma.JsonValue | null;
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
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                levelId: string;
                campusId: string;
            };
            professors: {
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
                avatarPath: string | null;
                userId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            moduleId: string;
        })[];
    } & {
        code: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
    }) | null>;
    create(schoolId: string, data: {
        name: string;
        code?: string;
    }): Promise<{
        _count: {
            classModules: number;
        };
    } & {
        code: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
    }>;
    update(id: string, schoolId: string, data: {
        name?: string;
        code?: string;
    }): Promise<{
        code: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
    } | null>;
    delete(id: string, schoolId: string): Promise<boolean>;
};
export {};
//# sourceMappingURL=academic-modules.repository.d.ts.map