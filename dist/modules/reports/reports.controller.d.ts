import { Request, Response, NextFunction } from 'express';
export declare const reportsController: {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    remove(req: Request, res: Response, next: NextFunction): Promise<void>;
    analyze(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=reports.controller.d.ts.map