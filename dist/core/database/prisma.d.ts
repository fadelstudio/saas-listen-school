import { PrismaClient } from "@prisma/client";
import pg from "pg";
declare global {
    var __prisma: PrismaClient | undefined;
    var __pool: pg.Pool | undefined;
}
export declare const prisma: PrismaClient;
/**
 * Exécute `fn` avec jusqu'à `maxRetries` tentatives et backoff exponentiel.
 * À utiliser pour les opérations critiques (login, register, analytics dashboard…).
 *
 * @example
 * const user = await withRetry(() => prisma.user.findUnique({ where: { id } }));
 */
export declare function withRetry<T>(fn: () => Promise<T>, maxRetries?: number, baseDelayMs?: number): Promise<T>;
/**
 * Retourne des métriques basiques du pool (utile pour les health checks).
 */
export declare function getPoolStats(): {
    total: number;
    idle: number;
    waiting: number;
};
//# sourceMappingURL=prisma.d.ts.map