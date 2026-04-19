import { CampusFilters } from './campuses.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const campusesRepository: {
    findAll(schoolId: string, filters: CampusFilters, pagination: PaginationArgs): Promise<{
        items: ({
            _count: {
                classes: number;
                users: number;
            };
        } & {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
            phone: string | null;
        })[];
        total: number;
    }>;
    findById(id: string, schoolId: string): Promise<({
        classes: ({
            _count: {
                users: number;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string;
            levelId: string;
        })[];
    } & {
        code: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        location: string | null;
        phone: string | null;
    }) | null>;
    create(data: {
        name: string;
        schoolId: string;
        location?: string;
    }): Promise<any>;
    update(id: string, data: {
        name?: string;
        location?: string;
    }, schoolId: string): Promise<{
        code: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        location: string | null;
        phone: string | null;
    } | null>;
    delete(id: string, schoolId: string): Promise<{
        code: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        location: string | null;
        phone: string | null;
    } | null>;
    findClasses(id: string, schoolId: string): Promise<({
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            order: number;
        };
        _count: {
            users: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string;
        levelId: string;
    })[]>;
    findStudents(id: string, schoolId: string): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        isActive: boolean;
        classId: string | null;
        class: {
            name: string;
        } | null;
    }[]>;
    getStats(id: string, schoolId: string): Promise<{
        classes: number;
        students: number;
        professors: number;
    }>;
    findProfessors(id: string, schoolId: string): Promise<({
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
    })[]>;
};
export {};
//# sourceMappingURL=campuses.repository.d.ts.map