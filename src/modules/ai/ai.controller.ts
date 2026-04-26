import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service';
import { chatService } from './chat.service';
import { BadRequestError } from '../../core/errors/AppError';

export const aiController = {
  async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await aiService.getJobs(req.query as Record<string, unknown>, req.schoolId as string);
      res.sendSuccess('AI jobs fetched', result);
    } catch (error) { next(error); }
  },

  async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await aiService.getJobById(req.params.jobId as string, req.schoolId as string);
      res.sendSuccess('AI job fetched', result);
    } catch (error) { next(error); }
  },

  async getJobResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await aiService.getJobResult(req.params.jobId as string, req.schoolId as string);
      res.sendSuccess('AI job result', result);
    } catch (error) { next(error); }
  },

  async retryJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await aiService.retryJob(req.params.jobId as string, req.user!.role, req.schoolId as string);
      res.sendSuccess('AI job retried', result);
    } catch (error) { next(error); }
  },

  // ── Legacy queue-based chat (kept for backward compat) ────────────────────
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await aiService.chat(req.body, req.user!.userId, req.schoolId as string);
      res.sendSuccess('Chat query submitted', result);
    } catch (error) { next(error); }
  },

  // ── NEW: Direct synchronous chat (< 2s, no queue) ─────────────────────────
  async chatDirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const { question, conversationId } = req.body as { question: string; conversationId?: string };
      if (!question?.trim()) throw new BadRequestError('question is required');

      const result = await chatService.askDirect(
        question.trim(),
        req.schoolId as string,
        req.user!.userId,
        conversationId
      );
      res.sendSuccess('Chat response', result);
    } catch (error) { next(error); }
  },

  // ── Conversation management ───────────────────────────────────────────────
  async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await chatService.getConversations(req.schoolId as string, req.user!.userId);
      res.sendSuccess('Conversations fetched', result);
    } catch (error) { next(error); }
  },

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await chatService.getMessages(req.params.id as string);
      res.sendSuccess('Messages fetched', result);
    } catch (error) { next(error); }
  },

  async saveConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await chatService.saveConversation(req.params.id as string);
      res.sendSuccess('Conversation saved', result);
    } catch (error) { next(error); }
  },

  async deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await chatService.deleteConversation(req.params.id as string);
      res.sendSuccess('Conversation deleted', result);
    } catch (error) { next(error); }
  },

  async generateSynthesis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.generateSynthesis(req.body, req.user!.role);
      res.sendSuccess('Synthesis job submitted', result);
    } catch (error) { next(error); }
  },
};
