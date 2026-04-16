"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiBalancer = exports.AiBalancer = void 0;
const system_service_1 = require("../../modules/system/system.service");
class AiBalancer {
    constructor() {
        this.currentActiveId = null;
        this.failures = new Map();
        this.COOLDOWN_MS = 60000; // 1 minute cooldown for failed models
    }
    static getInstance() {
        if (!AiBalancer.instance) {
            AiBalancer.instance = new AiBalancer();
        }
        return AiBalancer.instance;
    }
    /** Returns info about the last successful provider used */
    getStatus() {
        return { currentActiveId: this.currentActiveId };
    }
    async callAI(prompt, schoolId) {
        const settings = await system_service_1.systemService.getSettings(schoolId);
        if (!settings.aiEnabled) {
            throw new Error('AI is currently disabled by system settings');
        }
        const configs = settings.aiConfigs || [];
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
                }
                catch (err) {
                    console.error(`❌ Manual override AI failed (${override.name}):`, err);
                    // If override fails, we continue to fallback logic? 
                    // Usually, override means "force this", but let's fall back for resilience.
                }
            }
        }
        let lastError = null;
        // 2. Iterate through providers
        for (const config of sortedConfigs) {
            // Check cooldown
            const failInfo = this.failures.get(config.id);
            if (failInfo && Date.now() - failInfo.lastFail < this.COOLDOWN_MS) {
                // If it's a free model, we try it anyway as a last resort, or if it's the only one left
                if (!config.isFree)
                    continue;
            }
            try {
                console.log(`🤖 AI Balancer: Trying ${config.name} (${config.model})...`);
                const content = await this.executeCall(config, prompt);
                // Success!
                this.currentActiveId = config.id;
                this.failures.delete(config.id); // Reset failure on success
                return { content, provider: config.provider, model: config.model };
            }
            catch (err) {
                lastError = err;
                this.failures.set(config.id, {
                    lastFail: Date.now(),
                    count: (failInfo?.count || 0) + 1
                });
                console.warn(`⚠️ AI Balancer: ${config.name} failed:`, err instanceof Error ? err.message : err);
            }
        }
        const lastMessage = lastError instanceof Error ? lastError.message : 'Unknown';
        throw new Error(`AI Balancer: All ${configs.length} providers failed. Last error: ${lastMessage}`);
    }
    async executeCall(config, prompt) {
        if (config.provider.includes('GEMINI')) {
            return this.callGemini(config.apiKey, config.model, prompt);
        }
        else if (config.provider.includes('GROQ')) {
            return this.callGroq(config.apiKey, config.model, prompt);
        }
        else if (config.provider.includes('OPENAI')) {
            return this.callOpenAI(config.apiKey, config.model, prompt);
        }
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
    async callGemini(key, model, prompt) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        if (!res.ok)
            throw new Error(`Gemini error: ${res.status}`);
        const data = (await res.json());
        // Minimal runtime narrowing (avoid unsafe casts)
        if (typeof data === 'object' &&
            data !== null &&
            'candidates' in data &&
            Array.isArray(data.candidates)) {
            const candidates = data.candidates;
            const first = candidates[0];
            if (typeof first !== 'object' || first === null)
                return '';
            const content = first.content;
            if (typeof content !== 'object' || content === null)
                return '';
            const parts = content.parts;
            if (!Array.isArray(parts))
                return '';
            const firstPart = parts[0];
            if (typeof firstPart !== 'object' || firstPart === null)
                return '';
            const text = firstPart.text;
            return typeof text === 'string' ? text : '';
        }
        return '';
    }
    async callGroq(key, model, prompt) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
        });
        if (!res.ok)
            throw new Error(`Groq error: ${res.status}`);
        const data = (await res.json());
        if (typeof data === 'object' &&
            data !== null &&
            'choices' in data &&
            Array.isArray(data.choices)) {
            const first = data.choices[0];
            if (typeof first !== 'object' || first === null)
                return '';
            const message = first.message;
            if (typeof message !== 'object' || message === null)
                return '';
            const content = message.content;
            return typeof content === 'string' ? content : '';
        }
        return '';
    }
    async callOpenAI(key, model, prompt) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
        });
        if (!res.ok)
            throw new Error(`OpenAI error: ${res.status}`);
        const data = (await res.json());
        if (typeof data === 'object' &&
            data !== null &&
            'choices' in data &&
            Array.isArray(data.choices)) {
            const first = data.choices[0];
            if (typeof first !== 'object' || first === null)
                return '';
            const message = first.message;
            if (typeof message !== 'object' || message === null)
                return '';
            const content = message.content;
            return typeof content === 'string' ? content : '';
        }
        return '';
    }
}
exports.AiBalancer = AiBalancer;
exports.aiBalancer = AiBalancer.getInstance();
//# sourceMappingURL=AiBalancer.js.map