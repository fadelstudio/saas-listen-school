import { aiRepository } from './ai.repository';
import { jobQueue } from '../../core/config/queue';
import { NotFoundError, ForbiddenError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { AiJobFilters, ChatInput, SynthesisInput } from './ai.types';
import { logger } from '../../utils/logger';
import { AiJobStatus, Prisma } from '@prisma/client';

export const aiService = {
  async getJobById(jobId: string, schoolId?: string | null) {
    const job = await aiRepository.findJobById(jobId, schoolId ?? null);
    if (!job) throw new NotFoundError('AI Job');
    return job;
  },

  async getJobs(query: Record<string, unknown>, schoolId?: string | null) {
    const pagination = parsePagination(query);
    const filters: AiJobFilters = {
      status:       query.status as string | undefined,
      jobType:      query.jobType as string | undefined,
      reportId:     query.reportId as string | undefined,
      evaluationId: query.evaluationId as string | undefined,
    };
    const { items, total } = await aiRepository.findJobs(filters, pagination, schoolId ?? null);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getJobResult(jobId: string, schoolId?: string | null) {
    const job = await aiRepository.findJobById(jobId, schoolId ?? null);
    if (!job) throw new NotFoundError('AI Job');
    return { status: job.status, result: job.result, errorMessage: job.errorMessage };
  },

  async retryJob(jobId: string, userRole: string, schoolId?: string | null) {
    if (userRole !== 'ADMIN') throw new ForbiddenError('Only ADMIN can retry AI jobs');

    const job = await aiRepository.findJobById(jobId, schoolId ?? null);
    if (!job) throw new NotFoundError('AI Job');

    try {
      await jobQueue.add('ai-analysis', job.payload as Record<string, unknown>);
      return { retried: true, jobId };
    } catch (error) {
      logger.warn('Could not retry AI job (Redis down?)', { jobId, error });
      return { retried: false, jobId, reason: 'REDIS_UNAVAILABLE' };
    }
  },

  async chat(input: ChatInput, userId: string, schoolId: string) {
    const { chatService } = await import('./chat.service');
    let conversationId = input.conversationId;

    if (!conversationId) {
      const conv = await chatService.createConversation(schoolId, userId, input.question);
      conversationId = conv.id;
    }

    // Save user message
    await chatService.addMessage(conversationId as string, 'user', input.question);

    try {
      const bullJob = await jobQueue.add('ai-analysis', {
        type:     'chat-query',
        question: input.question,
        userId,
        conversationId, // Pass this to the worker
      });
      return { queued: true, jobId: bullJob.id, conversationId, message: 'Chat query queued' };
    } catch (error) {
      logger.warn('Could not enqueue AI chat (Redis down?)', { error });
      const dbJob = await aiRepository.createJob({
        jobType: 'chat-query',
        status: AiJobStatus.FAILED,
        payload: { type: 'chat-query', question: input.question, userId, conversationId } as unknown as Prisma.InputJsonObject,
        errorMessage: 'REDIS_UNAVAILABLE',
      });
      return { queued: false, jobId: dbJob.id, conversationId, reason: 'REDIS_UNAVAILABLE' };
    }
  },

  async generateSynthesis(input: SynthesisInput, userRole: string) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can generate synthesis');
    }
    try {
      const bullJob = await jobQueue.add('ai-analysis', {
        type:      'global-synthesis',
        startDate: input.startDate,
        endDate:   input.endDate,
      });
      return { queued: true, jobId: bullJob.id, message: 'Synthesis job queued — poll /api/ai/jobs/:jobId/result' };
    } catch (error) {
      logger.warn('Could not enqueue AI synthesis (Redis down?)', { error });
      const dbJob = await aiRepository.createJob({
        jobType: 'global-synthesis',
        status: AiJobStatus.FAILED,
        payload: { type: 'global-synthesis', startDate: input.startDate, endDate: input.endDate } as unknown as Prisma.InputJsonObject,
        errorMessage: 'REDIS_UNAVAILABLE',
      });
      return { queued: false, jobId: dbJob.id, reason: 'REDIS_UNAVAILABLE' };
    }
  },
};
