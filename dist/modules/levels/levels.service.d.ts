export declare const levelsService: {
    getAll(schoolId: string, query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        _count: {
            classes: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        order: number;
    }>>;
    getById(id: string, schoolId: string): Promise<{
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
        schoolId: string;
        order: number;
    }>;
    create(schoolId: string, data: {
        name: string;
        order?: number;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        order: number;
    }>;
    update(id: string, schoolId: string, data: {
        name?: string;
        order?: number;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        order: number;
    }>;
    delete(id: string, schoolId: string): Promise<void>;
};
//# sourceMappingURL=levels.service.d.ts.map