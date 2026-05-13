"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.withRetry = withRetry;
exports.getPoolStats = getPoolStats;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const env_1 = require("../config/env");
// ── Pool sizing ───────────────────────────────────────────────────────────────
// Supabase free : ~pool_size 15 en session, ~200 en transaction mode.
// Pour Railway avec 1 replica + le worker, on reste conservatif à 5
// (suffisant pour une API Express synchrone : requêtes courtes, cycle rapide).
// Chaque conteneur Railway aura AU MAX 5 connexions simultanées vers Supabase.
const POOL_MAX = parseInt(process.env.DB_POOL_MAX ?? "5", 10);
const POOL_IDLE_TIMEOUT_MS = 20000; // libère les connexions inactives
const POOL_CONNECT_TIMEOUT_MS = 5000; // échoue vite si Supabase est surchargé
function createPool() {
    const pool = new pg_1.default.Pool({
        connectionString: env_1.env.DATABASE_URL,
        max: POOL_MAX,
        idleTimeoutMillis: POOL_IDLE_TIMEOUT_MS,
        connectionTimeoutMillis: POOL_CONNECT_TIMEOUT_MS,
        // Pas de SSL explicite : la connection string Supabase l'inclut déjà via ?sslmode=require
    });
    // Log les erreurs de pool idle sans crash du process
    pool.on("error", (err) => {
        console.error("[DB Pool] Idle client error (non-fatal):", err.message);
    });
    pool.on("connect", () => {
        // Utile pour tracer le nombre de connexions en dev
        if (env_1.env.NODE_ENV === "development") {
            console.debug(`[DB Pool] New connection opened (total: ${pool.totalCount})`);
        }
    });
    return pool;
}
// Singleton pool — réutilisé entre les hot-reloads en dev
const pool = global.__pool ?? createPool();
if (env_1.env.NODE_ENV !== "production") {
    global.__pool = pool;
}
const adapter = new adapter_pg_1.PrismaPg(pool);
// Singleton PrismaClient
exports.prisma = global.__prisma ??
    new client_1.PrismaClient({
        adapter,
        log: env_1.env.NODE_ENV === "development"
            ? ["warn", "error"] // "query" retiré en dev : trop verbeux + pas utile pour ce bug
            : ["warn", "error"],
    });
if (env_1.env.NODE_ENV !== "production") {
    global.__prisma = exports.prisma;
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
function isRetryableError(err) {
    if (!err || typeof err !== "object")
        return false;
    const e = err;
    // DriverAdapterError cause (from @prisma/adapter-pg)
    const cause = e["cause"];
    if (cause?.code && RETRYABLE_ERROR_CODES.has(cause.code))
        return true;
    // PrismaClientKnownRequestError / raw pg error
    if (e["code"] && RETRYABLE_ERROR_CODES.has(e["code"]))
        return true;
    // Message-based fallback
    const msg = String(e["message"] ?? "");
    if (msg.includes("EMAXCONNSESSION") || msg.includes("max clients reached"))
        return true;
    return false;
}
/**
 * Exécute `fn` avec jusqu'à `maxRetries` tentatives et backoff exponentiel.
 * À utiliser pour les opérations critiques (login, register, analytics dashboard…).
 *
 * @example
 * const user = await withRetry(() => prisma.user.findUnique({ where: { id } }));
 */
async function withRetry(fn, maxRetries = 3, baseDelayMs = 200) {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (err) {
            lastError = err;
            if (!isRetryableError(err) || attempt === maxRetries - 1)
                throw err;
            const delay = baseDelayMs * 2 ** attempt + Math.random() * 100;
            console.warn(`[DB] Pool exhausted — retry ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms`);
            await new Promise((r) => setTimeout(r, delay));
        }
    }
    throw lastError;
}
/**
 * Retourne des métriques basiques du pool (utile pour les health checks).
 */
function getPoolStats() {
    return {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
    };
}
//# sourceMappingURL=prisma.js.map