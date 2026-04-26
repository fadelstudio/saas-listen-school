import { Request, Response, NextFunction } from 'express';
export declare const aiController: {
    getJobs(req: Request, res: Response, next: NextFunction): Promise<void>;
    getJobById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getJobResult(req: Request, res: Response, next: NextFunction): Promise<void>;
    retryJob(req: Request, res: Response, next: NextFunction): Promise<void>;
    chat(req: Request, res: Response, next: NextFunction): Promise<void>;
    chatDirect(req: Request, res: Response, next: NextFunction): Promise<void>;
    getConversations(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    saveConversation(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateSynthesis(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=ai.controller.d.ts.map