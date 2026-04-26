import { SupportedProvider } from './ModelDiscovery';
export interface AiResponse {
    content: string;
    provider: string;
    model: string;
}
/**
 * What admins store in systemSettings.aiConfigs[].
 * They only manage: provider, apiKey, optional preferredModel, priority.
 * The balancer auto-discovers the full model cascade behind the scenes.
 */
export interface AdminAiConfig {
    id: string;
    name: string;
    provider: SupportedProvider;
    apiKey: string;
    preferredModel?: string;
    priority: number;
}
export declare class AiBalancer {
    private static _instance;
    private currentActiveId;
    private failures;
    private lastNotif;
    private readonly NOTIF_THROTTLE;
    private readonly COOLDOWN;
    private readonly QUOTA_COOLDOWN;
    private constructor();
    static getInstance(): AiBalancer;
    getStatus(schoolId: string): Promise<{
        currentActiveId: string;
    } | {
        currentActiveId: null;
    }>;
    callAI(prompt: string, schoolId: string): Promise<AiResponse>;
    private loadAdminConfigs;
    /**
     * For each admin config, queries the provider's model-list API (cached 1h)
     * and returns the top-5 text models. PreferredModel is injected at position 0.
     * Global sort: adminPriority * 100 + modelRank → all P1 models before P2 models.
     */
    private buildCascade;
    private call;
    private callGemini;
    private callGroq;
    private callOpenAI;
    private callAnthropic;
    private notifyOnce;
    private sendAdminNotif;
    private soonestRetry;
}
export declare const aiBalancer: AiBalancer;
//# sourceMappingURL=AiBalancer.d.ts.map