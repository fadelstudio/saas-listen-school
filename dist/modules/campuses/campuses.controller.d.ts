import { Request, Response, NextFunction } from 'express';
export declare const campusesController: {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    remove(req: Request, res: Response, next: NextFunction): Promise<void>;
    getClasses(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStudents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProfessors(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=campuses.controller.d.ts.map