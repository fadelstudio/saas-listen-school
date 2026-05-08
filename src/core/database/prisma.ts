import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "../config/env";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pool: pg.Pool | undefined;
}

const pool =
  global.__pool ??
  new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: 20, // Increased pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (env.NODE_ENV !== "production") {
  global.__pool = pool;
}

const adapter = new PrismaPg(pool);

// Singleton — prevents multiple PrismaClient instances in dev (HMR)
export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
