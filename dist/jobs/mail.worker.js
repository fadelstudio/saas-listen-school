"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../core/config/redis");
const queue_1 = require("../core/config/queue");
const mail_service_1 = require("../core/email/mail.service");
const logger_1 = require("../utils/logger");
const worker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.EMAIL_SEND, async (job) => {
    const { to, subject } = job.data;
    logger_1.logger.info(`[mail:worker] Starting job ${job.id}`, { to, subject, attempt: job.attemptsMade + 1 });
    try {
        await (0, mail_service_1.sendTransactionalEmailDirectly)(job.data);
        logger_1.logger.info(`[mail:worker] ✅ Job ${job.id} for ${to} completed`);
    }
    catch (error) {
        const errMsg = error.message;
        logger_1.logger.error(`[mail:worker] ❌ Job ${job.id} for ${to} failed: ${errMsg}`, {
            stack: error.stack,
            data: job.data
        });
        throw error; // Let BullMQ handle retries
    }
}, {
    connection: redis_1.redisConnection,
    concurrency: 5,
});
worker.on("failed", (job, err) => {
    logger_1.logger.error(`[mail:worker] Job ${job?.id} failed permanently`, { error: err.message });
});
logger_1.logger.info("[mail:worker] Email worker started");
exports.default = worker;
//# sourceMappingURL=mail.worker.js.map