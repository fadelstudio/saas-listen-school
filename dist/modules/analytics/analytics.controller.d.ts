import { Request, Response, NextFunction } from 'express';
export declare const analyticsController: {
    getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTimeSeriesStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateGlobalAnalysis(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReports(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReportById(req: Request, res: Response, next: NextFunction): Promise<void>;
    generatePeriodicReport(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=analytics.controller.d.ts.map