import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

/** Load `.env` then override with `.env.local` (gitignored) for machine-specific secrets. */
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

function parseOptionalBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return value;
  const s = String(value).trim().toLowerCase();
  if (s === "") return undefined;
  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;
  return undefined;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Auth
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  /** Mot de passe appliqué par un admin lors de `POST .../reset-password-default` (compte utilisateur). */
  DEFAULT_PASSWORD_RESET: z.string().min(8).default("ListenReset1!"),
  // Registration OTP (first registration only). Keeps legacy name for compatibility.
  LOGIN_OTP_ENABLED: z.coerce.boolean().default(false),
  /** Comptes créés avec OTP requis mais jamais vérifiés : purge après ce délai (minutes). */
  PENDING_REGISTRATION_TTL_MINUTES: z.coerce.number().int().positive().default(30),

  // Supabase
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_KEY: z.string().min(1, "SUPABASE_KEY is required"),
  SUPABASE_BUCKET: z.string().default("attachments"),

  // Redis
  REDIS_URL: z.string().min(1).optional(),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),

  // AI providers
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),

  // Uploads
  MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10),
  SIGNED_URL_EXPIRES_IN: z.coerce.number().int().positive().default(60 * 60), // seconds

  // Analytics
  ANALYTICS_REPORT_INTERVAL_DAYS: z.coerce.number().int().positive().default(30),

  // Email (OTP login + password reset). Use MAIL_PROVIDER=console to log only (dev).
  PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  MAIL_PROVIDER: z.enum(["console", "resend"]).default("console"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().min(1).default("AFI-LISTEN <noreply@localhost>"),

  // OTP email branding (registration)
  OTP_SITE_NAME: z.string().min(1).optional(),
  OTP_EMAIL_SUBJECT: z.string().min(1).optional(),
  OTP_HELP_URL: z.string().url().optional(),

  // Tenant resolution (see .env.local.example)
  DEFAULT_SCHOOL_SLUG: z.string().min(1).optional(),
  /** @deprecated Prefer `TENANT_STRICT_MODE`. Kept for backward compatibility. */
  TENANT_RESOLUTION_MODE: z.enum(["strict", "fallback"]).default("strict"),
  /**
   * `true` : prod — sous-domaine puis `x-school-slug` uniquement (pas de path ni repli env).
   * `false` : dev/local — en plus : path `/<slug>/api/...` puis repli `DEFAULT_SCHOOL_SLUG`.
   */
  TENANT_STRICT_MODE: z.string().optional(),
});

const parsed = envSchema
  .superRefine((data, ctx) => {
    if (data.MAIL_PROVIDER === "resend" && !data.RESEND_API_KEY?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "RESEND_API_KEY is required when MAIL_PROVIDER=resend",
        path: ["RESEND_API_KEY"],
      });
    }
  })
  .safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const base = parsed.data;
const tenantStrictExplicit = parseOptionalBool(process.env.TENANT_STRICT_MODE);

/**
 * Mode strict : une seule source explicite `TENANT_STRICT_MODE` (true/false).
 * Si absent, compat : `TENANT_RESOLUTION_MODE` (strict|fallback).
 */
const tenantResolutionStrict =
  tenantStrictExplicit !== undefined
    ? tenantStrictExplicit
    : base.TENANT_RESOLUTION_MODE === "strict";

export type Env = z.infer<typeof envSchema> & {
  tenantResolutionStrict: boolean;
  /** Seule clé env pour le slug de repli (mode non strict). Aucun alias. */
  tenantDefaultSlug: string | undefined;
};

export const env: Env = {
  ...base,
  tenantResolutionStrict,
  /**
   * En mode strict, toujours `undefined` : `DEFAULT_SCHOOL_SLUG` n'est pas utilisé pour la résolution
   * (évite toute ambiguïité avec le repli). Renseigné seulement si `tenantResolutionStrict === false`.
   */
  tenantDefaultSlug: tenantResolutionStrict
    ? undefined
    : base.DEFAULT_SCHOOL_SLUG?.trim() || undefined,
};
