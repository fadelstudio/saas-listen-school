import { Request, Response, NextFunction } from 'express';
export declare const aiController: {
    getJobs(req: Request, res: Response, next: NextFunction): Promise<void>;
    getJobById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getJobResult(req: Request, res: Response, next: NextFunction): Promise<void>;
    retryJob(req: Request, res: Response, next: NextFunction): Promise<void>;
    chat(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateSynthesis(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=ai.controller.d.ts.map