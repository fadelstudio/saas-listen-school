export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    LOGIN_OTP_ENABLED: boolean;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    GEMINI_API_KEY: string;
    GROQ_API_KEY: string;
    MAX_FILE_SIZE_MB: number;
    SIGNED_URL_EXPIRES_IN: number;
    PUBLIC_APP_URL: string;
    MAIL_PROVIDER: "console" | "resend";
    EMAIL_FROM: string;
    REDIS_URL?: string | undefined;
    RESEND_API_KEY?: string | undefined;
    OTP_SITE_NAME?: string | undefined;
    OTP_EMAIL_SUBJECT?: string | undefined;
    OTP_HELP_URL?: string | undefined;
};
export type Env = typeof env;
//# sourceMappingURL=env.d.ts.map