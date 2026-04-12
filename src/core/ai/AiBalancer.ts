import { systemService } from '../../modules/system/system.service';

export interface AiResponse {
  content: string;
  provider: string;
  model: string;
}

interface AiConfig {
  id: string;
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  priority: number;
  isFree?: boolean;
}

export class AiBalancer {
  private static instance: AiBalancer;
  private currentActiveId: string | null = null;
  private failures: Map<string, { lastFail: number; count: number }> = new Map();
  private readonly COOLDOWN_MS = 60000; // 1 minute cooldown for failed models

  private constructor() {}

  public static getInstance(): AiBalancer {
    if (!AiBalancer.instance) {
      AiBalancer.instance = new AiBalancer();
    }
    return AiBalancer.instance;
  }

  /** Returns info about the last successful provider used */
  public getStatus() {
    return { currentActiveId: this.currentActiveId };
  }

  async callAI(prompt: string): Promise<AiResponse> {
    const settings = await systemService.getSettings();

    if (!settings.aiEnabled) {
      throw new Error('AI is currently disabled by system settings');
    }

    const configs = (settings.aiConfigs as unknown as AiConfig[]) || [];
    if (configs.length === 0) {
      throw new Error('No AI configurations found in system settings');
    }

    // Sort by priority (asc)
    const sortedConfigs = [...configs].sort((a, b) => a.priority - b.priority);

    // 1. Check for manual override
    if (settings.aiOverrideConfigId) {
      const override = configs.find(c => c.id === settings.aiOverrideConfigId);
      if (override) {
        try {
          const content = await this.executeCall(override, prompt);
          this.currentActiveId = override.id;
          return { content, provider: override.provider, model: override.model };
        } catch (err) {
          console.error(`❌ Manual override AI failed (${override.name}):`, err);
          // If override fails, we continue to fallback logic? 
          // Usually, override means "force this", but let's fall back for resilience.
        }
      }
    }

    let lastError: any = null;

    // 2. Iterate through providers
    for (const config of sortedConfigs) {
      // Check cooldown
      const failInfo = this.failures.get(config.id);
      if (failInfo && Date.now() - failInfo.lastFail < this.COOLDOWN_MS) {
        // If it's a free model, we try it anyway as a last resort, or if it's the only one left
        if (!config.isFree) continue; 
      }

      try {
        console.log(`🤖 AI Balancer: Trying ${config.name} (${config.model})...`);
        const content = await this.executeCall(config, prompt);
        
        // Success!
        this.currentActiveId = config.id;
        this.failures.delete(config.id); // Reset failure on success
        return { content, provider: config.provider, model: config.model };
      } catch (err) {
        lastError = err;
        this.failures.set(config.id, { 
          lastFail: Date.now(), 
          count: (failInfo?.count || 0) + 1 
        });
        console.warn(`⚠️ AI Balancer: ${config.name} failed:`, err instanceof Error ? err.message : err);
      }
    }

    throw new Error(`AI Balancer: All ${configs.length} providers failed. Last error: ${lastError?.message || 'Unknown'}`);
  }

  private async executeCall(config: AiConfig, prompt: string): Promise<string> {
    if (config.provider.includes('GEMINI')) {
      return this.callGemini(config.apiKey, config.model, prompt);
    } else if (config.provider.includes('GROQ')) {
      return this.callGroq(config.apiKey, config.model, prompt);
    } else if (config.provider.includes('OPENAI')) {
      return this.callOpenAI(config.apiKey, config.model, prompt);
    }
    throw new Error(`Unsupported AI provider: ${config.provider}`);
  }

  private async callGemini(key: string, model: string, prompt: string): Promise<string> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json() as any;
    return data.candidates[0]?.content.parts[0]?.text ?? '';
  }

  private async callGroq(key: string, model: string, prompt: string): Promise<string> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`Groq error: ${res.status}`);
    const data = await res.json() as any;
    return data.choices[0]?.message.content ?? '';
  }

  private async callOpenAI(key: string, model: string, prompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json() as any;
    return data.choices[0]?.message.content ?? '';
  }
}

export const aiBalancer = AiBalancer.getInstance();
