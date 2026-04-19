export declare const levelsRepository: {
    findAll(schoolId: string, pagination: {
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
            schoolId: string;
            order: number;
        })[];
        total: number;
    }>;
    findById(id: string, schoolId: string): Promise<({
        classes: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string;
            levelId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        order: number;
    }) | null>;
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
    } | null>;
    delete(id: string, schoolId: string): Promise<boolean>;
};
//# sourceMappingURL=levels.repository.d.ts.map