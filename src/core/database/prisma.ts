import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "../config/env";

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC
// Supabase Pooler modes:
//   • Session mode  (port 5432) : 1 connexion par client, max 15 sur plan gratuit
//     → CAUSE de EMAXCONNSESSION. NE PAS utiliser avec un pg.Pool.
//   • Transaction mode (port 6543) : connexion reléguée par transaction, ∼200 max
//     → LE MODE CORRECT pour une API Express + @prisma/adapter-pg.
//
// On doit aussi désactiver les prepared statements (pgbouncer=true dans DATABASE_URL)
// car transaction mode ne les supporte pas entre requêtes.
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pool: pg.Pool | undefined;
}

// ── Pool sizing ───────────────────────────────────────────────────────────────
// Supabase free : ~pool_size 15 en session, ~200 en transaction mode.
// Pour Railway avec 1 replica + le worker, on reste conservatif à 5
// (suffisant pour une API Express synchrone : requêtes courtes, cycle rapide).
// Chaque conteneur Railway aura AU MAX 5 connexions simultanées vers Supabase.
const POOL_MAX = parseInt(process.env.DB_POOL_MAX ?? "5", 10);
const POOL_IDLE_TIMEOUT_MS = 20_000;   // libère les connexions inactives
const POOL_CONNECT_TIMEOUT_MS = 5_000; // échoue vite si Supabase est surchargé

function createPool(): pg.Pool {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: POOL_MAX,
    idleTimeoutMillis: POOL_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: POOL_CONNECT_TIMEOUT_MS,
    // Pas de SSL explicite : la connection string Supabase l'inclut déjà via ?sslmode=require
  });

  // Log les erreurs de pool idle sans crash du process
  pool.on("error", (err: Error) => {
    console.error("[DB Pool] Idle client error (non-fatal):", err.message);
  });

  pool.on("connect", () => {
    // Utile pour tracer le nombre de connexions en dev
    if (env.NODE_ENV === "development") {
      console.debug(`[DB Pool] New connection opened (total: ${pool.totalCount})`);
    }
  });

  return pool;
}

// Singleton pool — réutilisé entre les hot-reloads en dev
const pool = global.__pool ?? createPool();
if (env.NODE_ENV !== "production") {
  global.__pool = pool;
}

const adapter = new PrismaPg(pool);

// Singleton PrismaClient
export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development"
        ? ["warn", "error"] // "query" retiré en dev : trop verbeux + pas utile pour ce bug
        : ["warn", "error"],
  });

if (env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

// ─────────────────────────────────────────────────────────────────────────────
// Retry helper — pour les opérations critiques exposées à l'épuisement du pool
// ─────────────────────────────────────────────────────────────────────────────
const RETRYABLE_ERROR_CODES = new Set([
  "XX000", // EMAXCONNSESSION / pool exhausted (Supabase Supavisor)
  "08006", // connection failure
  "08001", // connection rejected
  "57P03", // cannot connect now (DB restarting)
]);

function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;

  // DriverAdapterError cause (from @prisma/adapter-pg)
  const cause = e["cause"] as Record<string, unknown> | undefined;
  if (cause?.code && RETRYABLE_ERROR_CODES.has(cause.code as string)) return true;

  // PrismaClientKnownRequestError / raw pg error
  if (e["code"] && RETRYABLE_ERROR_CODES.has(e["code"] as string)) return true;

  // Message-based fallback
  const msg = String(e["message"] ?? "");
  if (msg.includes("EMAXCONNSESSION") || msg.includes("max clients reached")) return true;

  return false;
}

/**
 * Exécute `fn` avec jusqu'à `maxRetries` tentatives et backoff exponentiel.
 * À utiliser pour les opérations critiques (login, register, analytics dashboard…).
 *
 * @example
 * const user = await withRetry(() => prisma.user.findUnique({ where: { id } }));
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 200,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      if (!isRetryableError(err) || attempt === maxRetries - 1) throw err;

      const delay = baseDelayMs * 2 ** attempt + Math.random() * 100;
      console.warn(
        `[DB] Pool exhausted — retry ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

/**
 * Retourne des métriques basiques du pool (utile pour les health checks).
 */
export function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}
