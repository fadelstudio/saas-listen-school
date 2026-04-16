export declare const classModulesService: {
    getAll(filters: {
        classId?: string;
        moduleId?: string;
    }): Promise<({
        professors: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        }[];
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string;
            levelId: string;
        };
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
        classId: string;
        moduleId: string;
    })[]>;
    getById(id: string): Promise<{
        professors: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            campusId: string | null;
            userId: string | null;
        }[];
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string;
            levelId: string;
        };
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
        classId: string;
        moduleId: string;
    }>;
    create(data: {
        classId: string;
        moduleId: string;
        professorIds?: string[];
    }): Promise<{
        professors: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            campusId: string | null;
            userId: string | null;
        }[];
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string;
            levelId: string;
        };
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
        classId: string;
        moduleId: string;
    }>;
    update(id: string, data: {
        professorIds?: string[];
    }): Promise<{
        professors: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            campusId: string | null;
            userId: string | null;
        }[];
        class: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string;
            levelId: string;
        };
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
        classId: string;
        moduleId: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        moduleId: string;
    }>;
};
//# sourceMappingURL=class-modules.service.d.ts.map