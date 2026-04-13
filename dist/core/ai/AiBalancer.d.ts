export interface AiResponse {
    content: string;
    provider: string;
    model: string;
}
export declare class AiBalancer {
    private static instance;
    private currentActiveId;
    private failures;
    private readonly COOLDOWN_MS;
    private constructor();
    static getInstance(): AiBalancer;
    /** Returns info about the last successful provider used */
    getStatus(): {
        currentActiveId: string | null;
    };
    callAI(prompt: string): Promise<AiResponse>;
    private executeCall;
    private callGemini;
    private callGroq;
    private callOpenAI;
}
export declare const aiBalancer: AiBalancer;
//# sourceMappingURL=AiBalancer.d.ts.map