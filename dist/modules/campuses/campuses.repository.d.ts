import { CampusFilters } from './campuses.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const campusesRepository: {
    findAll(filters: CampusFilters, pagination: PaginationArgs): Promise<{
        items: ({
            _count: {
                users: number;
                classes: number;
            };
        } & {
            name: string;
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
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
        name: string;
        id: string;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    create(data: {
        name: string;
        location?: string;
    }): Promise<{
        name: string;
        id: string;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: {
        name?: string;
        location?: string;
    }): Promise<{
        name: string;
        id: string;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
export {};
//# sourceMappingURL=campuses.repository.d.ts.map