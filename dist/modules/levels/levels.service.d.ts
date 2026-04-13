export declare const levelsService: {
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        _count: {
            classes: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
    }>>;
    getById(id: string): Promise<{
        classes: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
    }>;
    create(data: {
        name: string;
        order?: number;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
    }>;
    update(id: string, data: {
        name?: string;
        order?: number;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
    }>;
};
//# sourceMappingURL=levels.service.d.ts.map