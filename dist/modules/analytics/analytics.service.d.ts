export declare const analyticsService: {
    getDashboardStats(schoolId: string, campusId?: string): Promise<{
        counters: {
            users: number;
            students: number;
            reports: number;
            evaluations: number;
            averageSatisfaction: number;
        };
        distributions: {
            reportsByType: {
                type: import("@prisma/client").$Enums.ReportType;
                count: number;
            }[];
            decisionsByStatus: {
                status: import("@prisma/client").$Enums.DecisionStatus;
                count: number;
            }[];
        };
    }>;
};
//# sourceMappingURL=analytics.service.d.ts.map