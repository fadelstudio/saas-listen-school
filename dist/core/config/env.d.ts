export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    GEMINI_API_KEY: string;
    GROQ_API_KEY: string;
    MAX_FILE_SIZE_MB: number;
    SIGNED_URL_EXPIRES_IN: number;
};
export type Env = typeof env;
//# sourceMappingURL=env.d.ts.map