import { Prisma } from '@prisma/client';
import { ClassFilters } from './classes.types';
import { parsePagination } from '../../utils/pagination';
type PaginationArgs = ReturnType<typeof parsePagination>;
export declare const classesRepository: {
    findAll(schoolId: string, filters: ClassFilters, pagination: PaginationArgs): Promise<{
        items: ({
            campus: {
                code: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                location: string | null;
                phone: string | null;
            };
            academicLevel: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                order: number;
            };
            _count: {
                users: number;
                reports: number;
            };
            classModules: ({
                module: {
                    code: string | null;
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    schoolId: string;
                };
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
            campusId: string;
            levelId: string;
        })[];
        total: number;
    }>;
    findById(id: string, schoolId: string): Promise<({
        campus: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
            phone: string | null;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            order: number;
        };
        users: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        }[];
        reports: {
            type: import("@prisma/client").$Enums.ReportType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string | null;
            classId: string | null;
            title: string;
            content: string;
            priority: import("@prisma/client").$Enums.Priority;
            status: import("@prisma/client").$Enums.ReportStatus;
            isAnonymous: boolean;
            category: string | null;
            authorId: string | null;
            professorId: string | null;
            moduleId: string | null;
            attachments: Prisma.JsonValue | null;
            deviceMetadata: Prisma.JsonValue | null;
            aiAnalysis: Prisma.JsonValue | null;
        }[];
        classModules: ({
            module: {
                code: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
            };
            professors: {
                email: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                firstName: string;
                lastName: string;
                matricule: string | null;
                numero: string | null;
                avatarPath: string | null;
                campusId: string | null;
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
        campusId: string;
        levelId: string;
    }) | null>;
    create(data: {
        name: string;
        campusId: string;
        levelId: string;
    }): Promise<{
        campus: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
            phone: string | null;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            order: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string;
        levelId: string;
    }>;
    update(id: string, schoolId: string, data: {
        name?: string;
        campusId?: string;
        levelId?: string;
    }): Promise<({
        campus: {
            code: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            location: string | null;
            phone: string | null;
        };
        academicLevel: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            order: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string;
        levelId: string;
    }) | null>;
    delete(id: string, schoolId: string): Promise<boolean>;
    findStudents(classId: string, schoolId: string): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        matricule: string | null;
        isActive: boolean;
        campusId: string | null;
    }[]>;
};
export {};
//# sourceMappingURL=classes.repository.d.ts.map