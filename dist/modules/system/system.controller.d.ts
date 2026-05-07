import { Request, Response, NextFunction } from 'express';
export declare const systemController: {
    getPublicSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAiStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAiModels(_req: Request, res: Response, next: NextFunction): Promise<void>;
    updateLogo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPublicFormData(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=system.controller.d.ts.map