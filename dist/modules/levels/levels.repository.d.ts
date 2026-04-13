export declare const levelsRepository: {
    findAll(pagination: {
        skip: number;
        limit: number;
    }): Promise<{
        items: ({
            _count: {
                classes: number;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
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
    }) | null>;
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
//# sourceMappingURL=levels.repository.d.ts.map