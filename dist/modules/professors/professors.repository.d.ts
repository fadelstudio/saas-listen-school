import { Prisma } from '@prisma/client';
import { ProfessorFilters } from './professors.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
/**
 * Filtre les professeurs appartenant à une école donnée.
 * Un professeur appartient à l'école si son schoolId correspond.
 */
export declare function professorInSchool(schoolId: string): Prisma.ProfessorWhereInput;
export declare const professorsRepository: {
    findAll(schoolId: string, filters: ProfessorFilters, pagination: PaginationArgs): Promise<{
        items: ({
            user: {
                id: string;
                avatarPath: string | null;
            } | null;
            _count: {
                evaluations: number;
            };
            modules: {
                moduleId: string;
            }[];
        } & {
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
        })[];
        total: number;
    }>;
    findById(id: string, schoolId: string): Promise<({
        user: {
            id: string;
            avatarPath: string | null;
        } | null;
        evaluations: ({
            module: {
                code: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
            };
            class: {
                campusId: string;
            };
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
    } & {
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
    }) | null>;
    create(data: {
        firstName: string;
        lastName: string;
        email: string;
        userId?: string;
        schoolId: string;
        matricule?: string | null;
        numero?: string | null;
        phone?: string | null;
    }): Promise<{
        user: {
            id: string;
            avatarPath: string | null;
        } | null;
        _count: {
            evaluations: number;
        };
    } & {
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
    }>;
    update(id: string, schoolId: string, data: {
        email?: string;
        userId?: string;
        matricule?: string | null;
        numero?: string | null;
        phone?: string | null;
    }): Promise<({
        user: {
            id: string;
            avatarPath: string | null;
        } | null;
        _count: {
            evaluations: number;
        };
    } & {
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
    }) | null>;
    delete(id: string, schoolId: string): Promise<boolean>;
};
export {};
//# sourceMappingURL=professors.repository.d.ts.map