import { z } from "zod";
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_URL: z.ZodString;
    DIRECT_URL: z.ZodOptional<z.ZodString>;
    DB_POOL_MAX: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    JWT_SECRET: z.ZodString;
    GOOGLE_OAUTH_CLIENT_IDS: z.ZodOptional<z.ZodString>;
    DEFAULT_PASSWORD_RESET: z.ZodDefault<z.ZodString>;
    LOGIN_OTP_ENABLED: z.ZodDefault<z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodCoercedBoolean<unknown>>>;
    PENDING_REGISTRATION_TTL_MINUTES: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    SUPABASE_URL: z.ZodString;
    SUPABASE_KEY: z.ZodString;
    SUPABASE_BUCKET: z.ZodDefault<z.ZodString>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    REDIS_HOST: z.ZodDefault<z.ZodString>;
    REDIS_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    GEMINI_API_KEY: z.ZodString;
    GROQ_API_KEY: z.ZodString;
    MAX_FILE_SIZE_MB: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    SIGNED_URL_EXPIRES_IN: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    ANALYTICS_REPORT_INTERVAL_DAYS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    PUBLIC_APP_URL: z.ZodDefault<z.ZodString>;
    PUBLIC_WEB_URL: z.ZodDefault<z.ZodString>;
    MAIL_PROVIDER: z.ZodDefault<z.ZodEnum<{
        console: "console";
        smtp: "smtp";
        brevo: "brevo";
    }>>;
    BREVO_API_KEY: z.ZodOptional<z.ZodString>;
    RESEND_API_KEY: z.ZodOptional<z.ZodString>;
    EMAIL_FROM: z.ZodDefault<z.ZodString>;
    SMTP_HOST: z.ZodOptional<z.ZodString>;
    SMTP_PORT: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    SMTP_USER: z.ZodOptional<z.ZodString>;
    SMTP_PASS: z.ZodOptional<z.ZodString>;
    SMTP_SECURE: z.ZodDefault<z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodCoercedBoolean<unknown>>>;
    OTP_SITE_NAME: z.ZodOptional<z.ZodString>;
    OTP_EMAIL_SUBJECT: z.ZodOptional<z.ZodString>;
    OTP_HELP_URL: z.ZodOptional<z.ZodString>;
    OTP_FALLBACK_ENABLED: z.ZodDefault<z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodCoercedBoolean<unknown>>>;
    OTP_FALLBACK_CODE: z.ZodOptional<z.ZodString>;
    DEFAULT_SCHOOL_SLUG: z.ZodOptional<z.ZodString>;
    TENANT_RESOLUTION_MODE: z.ZodDefault<z.ZodEnum<{
        strict: "strict";
        fallback: "fallback";
    }>>;
    TENANT_STRICT_MODE: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema> & {
    tenantResolutionStrict: boolean;
    /** Seule clé env pour le slug de repli (mode non strict). Aucun alias. */
    tenantDefaultSlug: string | undefined;
};
export declare const env: Env;
export {};
//# sourceMappingURL=env.d.ts.map