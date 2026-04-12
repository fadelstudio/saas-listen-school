import { Queue } from "bullmq";
import { redisConnection } from "./redis";

export const QUEUE_NAMES = {
  AI_ANALYSIS: "ai-analysis",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const jobQueue = new Queue(QUEUE_NAMES.AI_ANALYSIS, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: 50,
  },
});

jobQueue.on("error", (_err) => {
  // Silence Redis errors in development
});
