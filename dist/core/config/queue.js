"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailQueue = exports.jobQueue = exports.QUEUE_NAMES = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
exports.QUEUE_NAMES = {
    AI_ANALYSIS: "ai-analysis",
    EMAIL_SEND: "email-send",
};
exports.jobQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.AI_ANALYSIS, {
    connection: redis_1.redisConnection,
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
exports.mailQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.EMAIL_SEND, {
    connection: redis_1.redisConnection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: 100,
    },
});
exports.jobQueue.on("error", (_err) => {
    // Silence Redis errors in development
});
//# sourceMappingURL=queue.js.map