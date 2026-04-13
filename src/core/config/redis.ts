import { Redis, type RedisOptions } from "ioredis";
import { env } from "./env";
import { logger } from "../../utils/logger";

function getRedisOptions(): RedisOptions {
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    lazyConnect: true,
    enableOfflineQueue: false,
    // BullMQ recommends disabling request retries at client level.
    maxRetriesPerRequest: null,
    retryStrategy(times: number) {
      return Math.min(times * 100, 3000);
    },
  };
}

export const redisConnection = env.REDIS_URL
  ? new Redis(env.REDIS_URL, getRedisOptions())
  : new Redis(getRedisOptions());

redisConnection.on("connect", () => {
  logger.info("Redis connected");
});

let lastReconnectLog = 0;
redisConnection.on("reconnecting", (ms: number) => {
  const now = Date.now();
  if (now - lastReconnectLog > 5000) {
    logger.warn(`Redis reconnecting in ${ms}ms... (this warning is throttled)`);
    lastReconnectLog = now;
  }
});

redisConnection.on("error", (err: Error) => {
  const code = (err as unknown as { code?: string }).code;
  if (code === "ECONNREFUSED") {
    // Silence common connection errors to avoid log spamming
  } else {
    logger.warn("Redis error", { message: err.message });
  }
});
