"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const env_1 = require("../config/env");
const pool = new pg_1.default.Pool({ connectionString: env_1.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
// Singleton — prevents multiple PrismaClient instances in dev (HMR)
exports.prisma = global.__prisma ??
    new client_1.PrismaClient({
        adapter,
        log: env_1.env.NODE_ENV === "development"
            ? ["query", "warn", "error"]
            : ["warn", "error"],
    });
if (env_1.env.NODE_ENV !== "production") {
    global.__prisma = exports.prisma;
}
//# sourceMappingURL=prisma.js.map