import { ProfessorFilters } from './professors.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const professorsRepository: {
    findAll(filters: ProfessorFilters, pagination: PaginationArgs): Promise<{
        items: ({
            _count: {
                evaluations: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            campusId: string | null;
            userId: string | null;
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
        evaluations: ({
            module: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        campusId: string | null;
        userId: string | null;
    }) | null>;
    create(data: {
        firstName: string;
        lastName: string;
        email: string;
        userId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        campusId: string | null;
        userId: string | null;
    }>;
    update(id: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        userId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        campusId: string | null;
        userId: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        campusId: string | null;
        userId: string | null;
    }>;
};
export {};
//# sourceMappingURL=professors.repository.d.ts.map