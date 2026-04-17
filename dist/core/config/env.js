"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: zod_1.z.coerce.number().default(3000),
    // Database
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    // Auth
    JWT_SECRET: zod_1.z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    // Registration OTP (first registration only). Keeps legacy name for compatibility.
    LOGIN_OTP_ENABLED: zod_1.z.coerce.boolean().default(false),
    // Supabase
    SUPABASE_URL: zod_1.z.string().url("SUPABASE_URL must be a valid URL"),
    SUPABASE_KEY: zod_1.z.string().min(1, "SUPABASE_KEY is required"),
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
    // Email (OTP login + password reset). Use MAIL_PROVIDER=console to log only (dev).
    PUBLIC_APP_URL: zod_1.z.string().url().default("http://localhost:3000"),
    MAIL_PROVIDER: zod_1.z.enum(["console", "resend"]).default("console"),
    RESEND_API_KEY: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().min(1).default("AFI-LISTEN <noreply@localhost>"),
    // OTP email branding (registration)
    OTP_SITE_NAME: zod_1.z.string().min(1).optional(),
    OTP_EMAIL_SUBJECT: zod_1.z.string().min(1).optional(),
    OTP_HELP_URL: zod_1.z.string().url().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map