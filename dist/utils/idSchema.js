"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idStringSchema = void 0;
const zod_1 = require("zod");
/**
 * Prisma `@default(cuid())` / `@default(uuid())` / seed string IDs (ex. `class-l3-info`).
 * Keep permissive but bounded to avoid huge arbitrary strings.
 */
exports.idStringSchema = zod_1.z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid id format");
//# sourceMappingURL=idSchema.js.map