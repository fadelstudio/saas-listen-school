import { Prisma } from '@prisma/client';
import { ProfessorFilters } from './professors.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
/** Prof rattaché à l’école : campus dans l’école OU aucun campus (= tous les campus). */
export declare function professorInSchool(schoolId: string): Prisma.ProfessorWhereInput;
export declare const professorsRepository: {
    findAll(schoolId: string, filters: ProfessorFilters, pagination: PaginationArgs): Promise<{
        items: ({
            campus: {
                code: string | null;
                name: string;
                id: string;
            } | null;
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
            phone: string | null;
            firstName: string;
            lastName: string;
            matricule: string | null;
            numero: string | null;
            avatarPath: string | null;
            campusId: string | null;
            userId: string | null;
        })[];
        total: number;
    }>;
    findById(id: string, schoolId: string): Promise<({
        campus: {
            code: string | null;
            name: string;
            id: string;
        } | null;
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
    } & {
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        avatarPath: string | null;
        campusId: string | null;
        userId: string | null;
    }) | null>;
    create(data: {
        firstName: string;
        lastName: string;
        email: string;
        userId?: string;
        campusId: string | null;
        matricule?: string | null;
        numero?: string | null;
        phone?: string | null;
    }): Promise<{
        campus: {
            code: string | null;
            name: string;
            id: string;
        } | null;
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
        phone: string | null;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        avatarPath: string | null;
        campusId: string | null;
        userId: string | null;
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
    }): Promise<({
        campus: {
            code: string | null;
            name: string;
            id: string;
        } | null;
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
        phone: string | null;
        firstName: string;
        lastName: string;
        matricule: string | null;
        numero: string | null;
        avatarPath: string | null;
        campusId: string | null;
        userId: string | null;
    }) | null>;
    delete(id: string, schoolId: string): Promise<boolean>;
};
export {};
//# sourceMappingURL=professors.repository.d.ts.map