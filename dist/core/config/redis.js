"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const ioredis_1 = require("ioredis");
const env_1 = require("./env");
const logger_1 = require("../../utils/logger");
function getRedisOptions() {
    return {
        host: env_1.env.REDIS_HOST,
        port: env_1.env.REDIS_PORT,
        db: 0,
        lazyConnect: true,
        enableOfflineQueue: false,
        // BullMQ recommends disabling request retries at client level.
        maxRetriesPerRequest: null,
        retryStrategy(times) {
            return Math.min(times * 100, 3000);
        },
    };
}
exports.redisConnection = env_1.env.REDIS_URL
    ? new ioredis_1.Redis(env_1.env.REDIS_URL, getRedisOptions())
    : new ioredis_1.Redis(getRedisOptions());
exports.redisConnection.on("connect", () => {
    logger_1.logger.info("Redis connected");
});
let lastReconnectLog = 0;
exports.redisConnection.on("reconnecting", (ms) => {
    const now = Date.now();
    if (now - lastReconnectLog > 5000) {
        logger_1.logger.warn(`Redis reconnecting in ${ms}ms... (this warning is throttled)`);
        lastReconnectLog = now;
    }
});
exports.redisConnection.on("error", (err) => {
    const code = err.code;
    if (code === "ECONNREFUSED") {
        // Silence common connection errors to avoid log spamming
    }
    else {
        logger_1.logger.warn("Redis error", { message: err.message });
    }
});
//# sourceMappingURL=redis.js.map