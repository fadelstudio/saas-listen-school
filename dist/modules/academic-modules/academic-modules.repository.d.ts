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
                campusId: string | null;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                matricule: string | null;
                role: import("@prisma/client").$Enums.Role;
                isActive: boolean;
                classId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            moduleId: string;
            professorId: string;
            status: import("@prisma/client").$Enums.EvaluationStatus;
            isAnonymous: boolean;
            reportId: string | null;
            evaluatorId: string | null;
            score: number | null;
            clarityScore: number | null;
            pedagogyScore: number | null;
            availabilityScore: number | null;
            rhythmScore: number | null;
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
                id: string;
                createdAt: Date;
                updatedAt: Date;
                campusId: string | null;
                email: string;
                firstName: string;
                lastName: string;
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