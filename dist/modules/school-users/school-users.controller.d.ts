import { Request, Response, NextFunction } from 'express';
export declare const schoolUsersController: {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    listStaff(req: Request, res: Response, next: NextFunction): Promise<void>;
    listStudents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=school-users.controller.d.ts.map