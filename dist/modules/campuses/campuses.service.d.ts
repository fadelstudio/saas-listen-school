export declare const campusesService: {
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
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
    }>>;
    getById(id: string): Promise<{
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
    }>;
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
//# sourceMappingURL=campuses.service.d.ts.map