import { Prisma } from '@prisma/client';
import { ClassFilters } from './classes.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const classesRepository: {
    findAll(filters: ClassFilters, pagination: PaginationArgs): Promise<{
        items: ({
            campus: {
                name: string;
                id: string;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            academicLevel: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                order: number;
            };
            classModules: ({
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
            })[];
            _count: {
                users: number;
                reports: number;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelId: string;
            campusId: string;
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
        campus: {
            name: string;
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
        };
        users: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        }[];
        reports: {
            type: import(".prisma/client").$Enums.ReportType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string | null;
            title: string;
            moduleId: string | null;
            professorId: string | null;
            status: import(".prisma/client").$Enums.ReportStatus;
            content: string;
            priority: import(".prisma/client").$Enums.Priority;
            isAnonymous: boolean;
            category: string | null;
            authorId: string | null;
            attachments: Prisma.JsonValue | null;
            deviceMetadata: Prisma.JsonValue | null;
            aiAnalysis: Prisma.JsonValue | null;
        }[];
        classModules: ({
            module: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
            };
            professors: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                campusId: string | null;
                email: string;
                firstName: string;
                lastName: string;
                userId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            moduleId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        levelId: string;
        campusId: string;
    }) | null>;
    create(data: {
        name: string;
        campusId: string;
        levelId: string;
    }): Promise<{
        campus: {
            name: string;
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
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
        levelId: string;
        campusId: string;
    }>;
    update(id: string, data: {
        name?: string;
        campusId?: string;
        levelId?: string;
    }): Promise<{
        campus: {
            name: string;
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
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
        levelId: string;
        campusId: string;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        levelId: string;
        campusId: string;
    }>;
};
export {};
//# sourceMappingURL=classes.repository.d.ts.map