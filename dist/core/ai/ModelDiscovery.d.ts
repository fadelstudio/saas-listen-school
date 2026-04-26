export type SupportedProvider = 'GEMINI' | 'GROQ' | 'OPENAI' | 'ANTHROPIC';
export interface DiscoveredModel {
    id: string;
    name: string;
    score: number;
}
export declare const FALLBACK_TOP5: Record<SupportedProvider, DiscoveredModel[]>;
export declare class ModelDiscovery {
    private static _instance;
    private cache;
    private readonly TTL;
    private constructor();
    static getInstance(): ModelDiscovery;
    /**
     * Returns up to `limit` models for a provider, ranked by score (best first).
     * Tries live discovery, falls back to hardcoded FALLBACK_TOP5.
     */
    getTopModels(provider: SupportedProvider, apiKey: string, limit?: number): Promise<DiscoveredModel[]>;
    invalidate(provider: SupportedProvider, apiKey: string): void;
    private discover;
    private discoverGemini;
    private scoreGemini;
    private discoverGroq;
    private scoreGroq;
    private discoverOpenAI;
    private scoreOpenAI;
    private discoverAnthropic;
    private scoreAnthropic;
    private hash;
}
export declare const modelDiscovery: ModelDiscovery;
//# sourceMappingURL=ModelDiscovery.d.ts.map