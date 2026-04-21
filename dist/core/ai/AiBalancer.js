"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
            if (process.env.GEMINI_API_KEY) {
                configs.push({ id: 'env-gemini', name: 'Gemini Pro (Env)', provider: 'GEMINI', model: 'gemini-pro', apiKey: process.env.GEMINI_API_KEY, priority: 1, isFree: true });
            }
            if (process.env.GROQ_API_KEY) {
                configs.push({ id: 'env-groq', name: 'Groq Llama (Env)', provider: 'GROQ', model: 'llama3-70b-8192', apiKey: process.env.GROQ_API_KEY, priority: 2, isFree: true });
            }
            if (configs.length === 0) {
                throw new Error('No AI configurations found in system settings or .env');
            }
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
        // Notify admins that AI failed
        try {
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../../core/database/prisma')));
            const admins = await prisma.user.findMany({
                where: { role: 'ADMIN', schoolId }
            });
            for (const admin of admins) {
                await prisma.notification.create({
                    data: {
                        title: '⚠️ Alerte IA - Échec de tous les fournisseurs',
                        message: `Tous les modèles d'Intelligence Artificielle ont échoué (${configs.length} testés). Dernière erreur : ${lastMessage}. Le système fonctionne en mode dégradé sans IA.`,
                        type: 'SYSTEM_ALERT',
                        userId: admin.id,
                        schoolId
                    }
                });
            }
        }
        catch (notifErr) {
            console.error('⚠️ Failed to send AI failure notification', notifErr);
        }
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