import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service';
import { sendSuccess } from '../../utils/response';

export const aiController = {
  async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.getJobs(req.query as Record<string, unknown>);
      sendSuccess(res, 'AI jobs fetched', result);
    } catch (error) { next(error); }
  },

  async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.getJobById(req.params.jobId as string);
      sendSuccess(res, 'AI job fetched', result);
    } catch (error) { next(error); }
  },

  async getJobResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.getJobResult(req.params.jobId as string);
      sendSuccess(res, 'AI job result', result);
    } catch (error) { next(error); }
  },

  async retryJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.retryJob(req.params.jobId as string, req.user!.role);
      sendSuccess(res, 'AI job retried', result);
    } catch (error) { next(error); }
  },

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.chat(req.body, req.user!.userId);
      sendSuccess(res, 'Chat query submitted', result);
    } catch (error) { next(error); }
  },

  async generateSynthesis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.generateSynthesis(req.body, req.user!.role);
      sendSuccess(res, 'Synthesis job submitted', result);
    } catch (error) { next(error); }
  },
};
