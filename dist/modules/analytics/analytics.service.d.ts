import { Prisma } from '@prisma/client';
import { GlobalAnalysisInput } from './analytics.schema';
export declare const analyticsService: {
    resolveScopedCampusIds(userRole?: string, userCampusIds?: string[], requestedCampusId?: string): string[] | undefined;
    getDashboardStats(schoolId: string, campusIds?: string[]): Promise<{
        counters: {
            users: number;
            students: number;
            reports: number;
            evaluations: number;
            averageSatisfaction: number;
        };
        trends: {
            reports: number;
            evaluations: number;
            students: number;
            users: number;
            satisfaction: number;
        };
        distributions: {
            reportsByType: {
                type: import("@prisma/client").$Enums.ReportType;
                count: number;
            }[];
            decisionsByStatus: {
                status: any;
                count: any;
            }[];
        };
    }>;
    getTimeSeriesStats(schoolId: string, period?: "day" | "week" | "month" | "year", campusIds?: string[]): Promise<{
        date: any;
        submitted: number;
        inProgress: number;
        resolved: number;
    }[]>;
    generateGlobalAnalysis(input: GlobalAnalysisInput, userId: string, schoolId: string): Promise<{
        report: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            title: string;
            content: Prisma.JsonValue;
            filters: Prisma.JsonValue;
            isRead: boolean;
            generatedById: string;
        };
        decisionsCreatedCount: number;
        aiSummary: any;
    }>;
    generatePeriodicReport(schoolId: string, userId: string): Promise<{
        report: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            title: string;
            content: Prisma.JsonValue;
            filters: Prisma.JsonValue;
            isRead: boolean;
            generatedById: string;
        };
        decisionsCreatedCount: number;
        aiSummary: any;
    }>;
    ensureSchema(): Promise<void>;
    getReports(schoolId: string, filters?: {
        limit?: number;
        page?: number;
        periodic?: boolean;
        q?: string;
    }): Promise<{
        items: any[];
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getReportById(id: string, schoolId: string): Promise<any>;
};
//# sourceMappingURL=analytics.service.d.ts.map