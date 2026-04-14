import { z } from "zod";

/**
 * Prisma `@default(cuid())` / `@default(uuid())` / seed string IDs (ex. `class-l3-info`).
 * Keep permissive but bounded to avoid huge arbitrary strings.
 */
export const idStringSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid id format");
