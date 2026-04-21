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
            levelId: string;
            campusId: string;
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
        levelId: string;
        campusId: string;
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
    /**
     * Retourne les professeurs enseignant dans ce campus.
     * Fix #6 : schoolId est maintenant utilisé (était ignoré avec le préfixe _).
     * Double filtre : campus + schoolId pour éviter toute fuite si l'id du campus
     * était réutilisé dans une autre école (cas improbable mais défensif).
     */
    findProfessors(id: string, schoolId: string): Promise<({
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
    })[]>;
};
export {};
//# sourceMappingURL=campuses.repository.d.ts.map