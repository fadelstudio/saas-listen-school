import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service';

export const aiController = {
  async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.getJobs(req.query as Record<string, unknown>, req.user?.schoolId || null);
      res.sendSuccess('AI jobs fetched', result);
    } catch (error) { next(error); }
  },

  async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.getJobById(req.params.jobId as string, req.user?.schoolId || null);
      res.sendSuccess('AI job fetched', result);
    } catch (error) { next(error); }
  },

  async getJobResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.getJobResult(req.params.jobId as string, req.user?.schoolId || null);
      res.sendSuccess('AI job result', result);
    } catch (error) { next(error); }
  },

  async retryJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.retryJob(req.params.jobId as string, req.user!.role, req.user?.schoolId || null);
      res.sendSuccess('AI job retried', result);
    } catch (error) { next(error); }
  },

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.chat(req.body, req.user!.userId);
      res.sendSuccess('Chat query submitted', result);
    } catch (error) { next(error); }
  },

  async generateSynthesis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.generateSynthesis(req.body, req.user!.role);
      res.sendSuccess('Synthesis job submitted', result);
    } catch (error) { next(error); }
  },
};
