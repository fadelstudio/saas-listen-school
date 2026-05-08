"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
/** Load `.env` then override with `.env.local` (gitignored) for machine-specific secrets. */
dotenv_1.default.config();
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env.local"), override: true });
function parseOptionalBool(value) {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value === "boolean")
        return value;
    const s = String(value).trim().toLowerCase();
    if (s === "")
        return undefined;
    if (["true", "1", "yes", "on"].includes(s))
        return true;
    if (["false", "0", "no", "off"].includes(s))
        return false;
    return undefined;
}
const zEnvBool = zod_1.z.preprocess((v) => parseOptionalBool(v), zod_1.z.coerce.boolean());
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: zod_1.z.coerce.number().default(3000),
    // Database
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    // Auth
    JWT_SECRET: zod_1.z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    /** Mot de passe appliqué par un admin lors de `POST .../reset-password-default` (compte utilisateur). */
    DEFAULT_PASSWORD_RESET: zod_1.z.string().min(8).default("ListenReset1!"),
    // Registration OTP (first registration only). Keeps legacy name for compatibility.
    LOGIN_OTP_ENABLED: zEnvBool.default(false),
    /** Comptes créés avec OTP requis mais jamais vérifiés : purge après ce délai (minutes). */
    PENDING_REGISTRATION_TTL_MINUTES: zod_1.z.coerce.number().int().positive().default(30),
    // Supabase
    SUPABASE_URL: zod_1.z.string().url("SUPABASE_URL must be a valid URL"),
    SUPABASE_KEY: zod_1.z.string().min(1, "SUPABASE_KEY is required"),
    SUPABASE_BUCKET: zod_1.z.string().default("attachments"),
    // Redis
    REDIS_URL: zod_1.z.string().min(1).optional(),
    REDIS_HOST: zod_1.z.string().default("localhost"),
    REDIS_PORT: zod_1.z.coerce.number().default(6379),
    // AI providers
    GEMINI_API_KEY: zod_1.z.string().min(1, "GEMINI_API_KEY is required"),
    GROQ_API_KEY: zod_1.z.string().min(1, "GROQ_API_KEY is required"),
    // Uploads
    MAX_FILE_SIZE_MB: zod_1.z.coerce.number().int().positive().default(10),
    SIGNED_URL_EXPIRES_IN: zod_1.z.coerce.number().int().positive().default(60 * 60), // seconds
    // Analytics
    ANALYTICS_REPORT_INTERVAL_DAYS: zod_1.z.coerce.number().int().positive().default(30),
    // Email (OTP login + password reset). Use MAIL_PROVIDER=console to log only (dev).
    PUBLIC_APP_URL: zod_1.z.string().url().default("http://localhost:3000"),
    MAIL_PROVIDER: zod_1.z.enum(["console", "smtp", "brevo"]).default("console"),
    BREVO_API_KEY: zod_1.z.string().optional(),
    RESEND_API_KEY: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().min(1).default("AFI-LISTEN <noreply@localhost>"),
    // SMTP (for dev testing with Mailtrap/Ethereal)
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    SMTP_SECURE: zEnvBool.default(false),
    // OTP email branding (registration)
    OTP_SITE_NAME: zod_1.z.string().min(1).optional(),
    OTP_EMAIL_SUBJECT: zod_1.z.string().min(1).optional(),
    OTP_HELP_URL: zod_1.z.string().url().optional(),
    OTP_FALLBACK_ENABLED: zEnvBool.default(false),
    OTP_FALLBACK_CODE: zod_1.z
        .string()
        .regex(/^\d{6}$/, "OTP_FALLBACK_CODE must be a 6-digit numeric string")
        .optional(),
    // Tenant resolution (see .env.local.example)
    DEFAULT_SCHOOL_SLUG: zod_1.z.string().min(1).optional(),
    /** @deprecated Prefer `TENANT_STRICT_MODE`. Kept for backward compatibility. */
    TENANT_RESOLUTION_MODE: zod_1.z.enum(["strict", "fallback"]).default("strict"),
    /**
     * `true` : prod — sous-domaine puis `x-school-slug` uniquement (pas de path ni repli env).
     * `false` : dev/local — en plus : path `/<slug>/api/...` puis repli `DEFAULT_SCHOOL_SLUG`.
     */
    TENANT_STRICT_MODE: zod_1.z.string().optional(),
});
const parsed = envSchema
    .superRefine((data, ctx) => {
    if (data.MAIL_PROVIDER === "smtp") {
        if (!data.SMTP_HOST)
            ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: "SMTP_HOST is required when MAIL_PROVIDER=smtp", path: ["SMTP_HOST"] });
        if (!data.SMTP_PORT)
            ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: "SMTP_PORT is required when MAIL_PROVIDER=smtp", path: ["SMTP_PORT"] });
    }
    if (data.MAIL_PROVIDER === "brevo" && !data.BREVO_API_KEY) {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: "BREVO_API_KEY is required when MAIL_PROVIDER=brevo", path: ["BREVO_API_KEY"] });
    }
    if (data.NODE_ENV === "production" && /localhost|127\.0\.0\.1/i.test(data.PUBLIC_APP_URL)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "PUBLIC_APP_URL must be a public HTTPS URL in production",
            path: ["PUBLIC_APP_URL"],
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
const tenantResolutionStrict = tenantStrictExplicit !== undefined
    ? tenantStrictExplicit
    : base.TENANT_RESOLUTION_MODE === "strict";
exports.env = {
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
//# sourceMappingURL=env.js.map