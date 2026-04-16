export declare const classModulesRepository: {
    findAll(filters: {
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
    findById(id: string): Promise<({
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
    }) | null>;
    findByClassAndModule(classId: string, moduleId: string): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        moduleId: string;
    }) | null>;
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
//# sourceMappingURL=class-modules.repository.d.ts.map