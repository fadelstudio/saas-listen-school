import { aiRepository } from './ai.repository';
import { jobQueue } from '../../core/config/queue';
import { NotFoundError, ForbiddenError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { AiJobFilters, ChatInput, SynthesisInput } from './ai.types';

export const aiService = {
  async getJobById(jobId: string) {
    const job = await aiRepository.findJobById(jobId);
    if (!job) throw new NotFoundError('AI Job');
    return job;
  },

  async getJobs(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: AiJobFilters = {
      status:       query.status as string | undefined,
      jobType:      query.jobType as string | undefined,
      reportId:     query.reportId as string | undefined,
      evaluationId: query.evaluationId as string | undefined,
    };
    const { items, total } = await aiRepository.findJobs(filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getJobResult(jobId: string) {
    const job = await aiRepository.findJobById(jobId);
    if (!job) throw new NotFoundError('AI Job');
    return { status: job.status, result: job.result, errorMessage: job.errorMessage };
  },

  async retryJob(jobId: string, userRole: string) {
    if (userRole !== 'ADMIN') throw new ForbiddenError('Only ADMIN can retry AI jobs');

    const job = await aiRepository.findJobById(jobId);
    if (!job) throw new NotFoundError('AI Job');

    await jobQueue.add('ai-analysis', job.payload as Record<string, unknown>);
    return { retried: true, jobId };
  },

  async chat(input: ChatInput, userId: string) {
    const bullJob = await jobQueue.add('ai-analysis', {
      type:     'chat-query',
      question: input.question,
      userId,
    });
    return { jobId: bullJob.id, message: 'Chat query queued — poll /api/ai/jobs/:jobId/result' };
  },

  async generateSynthesis(input: SynthesisInput, userRole: string) {
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      throw new ForbiddenError('Only MANAGER or ADMIN can generate synthesis');
    }
    const bullJob = await jobQueue.add('ai-analysis', {
      type:      'global-synthesis',
      startDate: input.startDate,
      endDate:   input.endDate,
    });
    return { jobId: bullJob.id, message: 'Synthesis job queued — poll /api/ai/jobs/:jobId/result' };
  },
};
