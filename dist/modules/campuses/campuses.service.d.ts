export declare const campusesService: {
    getAll(query: Record<string, unknown>): Promise<import("../../utils/pagination").PaginatedResult<{
        _count: {
            classes: number;
            users: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        location: string | null;
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
            campusId: string;
            levelId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        location: string | null;
    }>;
    create(data: {
        name: string;
        schoolId: string;
        location?: string;
    }): Promise<any>;
    update(id: string, data: {
        name?: string;
        location?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        location: string | null;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        location: string | null;
    }>;
    getClasses(id: string): Promise<({
        _count: {
            users: number;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string;
        levelId: string;
    })[]>;
    getStudents(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        isActive: boolean;
        classId: string | null;
        class: {
            name: string;
        } | null;
    }[]>;
    getStats(id: string): Promise<{
        classes: number;
        students: number;
        professors: number;
    }>;
    getProfessors(id: string): Promise<({
        _count: {
            evaluations: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        campusId: string | null;
        userId: string | null;
    })[]>;
};
//# sourceMappingURL=campuses.service.d.ts.map