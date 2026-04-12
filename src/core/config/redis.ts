import { Redis } from "ioredis";
import { env } from "./env";

export const redisConnection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
});

redisConnection.on("connect", () => {
  console.log("📡 Redis connected");
});

let lastReconnectLog = 0;
redisConnection.on("reconnecting", (ms: number) => {
  const now = Date.now();
  if (now - lastReconnectLog > 5000) {
    console.log(`🔌 Redis reconnecting in ${ms}ms... (this warning is throttled)`);
    lastReconnectLog = now;
  }
});

redisConnection.on("error", (err: Error) => {
  if ((err as any).code === "ECONNREFUSED") {
    // Silence common connection errors to avoid log spamming
  } else {
    console.warn("⚠️ Redis Error:", err.message);
  }
});
