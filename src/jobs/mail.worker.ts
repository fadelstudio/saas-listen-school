import { Worker, Job } from "bullmq";
import { redisConnection } from "../core/config/redis";
import { QUEUE_NAMES } from "../core/config/queue";
import { sendTransactionalEmailDirectly } from "../core/email/mail.service";
import { logger } from "../utils/logger";

const worker = new Worker(
  QUEUE_NAMES.EMAIL_SEND,
  async (job: Job) => {
    const { to, subject, text, html } = job.data;
    logger.info(`[mail:worker] Processing job ${job.id} for ${to}`);
    
    try {
      await sendTransactionalEmailDirectly({ to, subject, text, html });
      logger.info(`[mail:worker] Job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`[mail:worker] Job ${job.id} failed:`, { error: (error as Error).message });
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
