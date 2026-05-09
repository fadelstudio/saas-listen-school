import { Worker, Job } from "bullmq";
import { redisConnection } from "../core/config/redis";
import { QUEUE_NAMES } from "../core/config/queue";
import { sendTransactionalEmailDirectly } from "../core/email/mail.service";
import { logger } from "../utils/logger";

const worker = new Worker(
  QUEUE_NAMES.EMAIL_SEND,
  async (job: Job) => {
    const { to, subject } = job.data;
    logger.info(`[mail:worker] Starting job ${job.id}`, { to, subject, attempt: job.attemptsMade + 1 });
    
    try {
      await sendTransactionalEmailDirectly(job.data);
      logger.info(`[mail:worker] ✅ Job ${job.id} for ${to} completed`);
    } catch (error) {
      const errMsg = (error as Error).message;
      logger.error(`[mail:worker] ❌ Job ${job.id} for ${to} failed: ${errMsg}`, { 
        stack: (error as Error).stack,
        data: job.data 
      });
      throw error; // Let BullMQ handle retries
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on("failed", (job, err) => {
  logger.error(`[mail:worker] Job ${job?.id} failed permanently`, { error: err.message });
});

logger.info("[mail:worker] Email worker started");

export default worker;
