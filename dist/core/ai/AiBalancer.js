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
const ModelDiscovery_1 = require("./ModelDiscovery");
// ─────────────────────────────────────────────────────────────────────────────
// Error classifiers
// ─────────────────────────────────────────────────────────────────────────────
function isQuotaErr(err) {
    const m = (err instanceof Error ? err.message : String(err)).toLowerCase();
    return m.includes('429') || m.includes('resource_exhausted') || m.includes('quota') ||
        m.includes('rate limit') || m.includes('ratelimit') || m.includes('token limit');
}
function isNotFoundErr(err) {
    const m = (err instanceof Error ? err.message : String(err)).toLowerCase();
    return m.includes('404') || m.includes('not found') || m.includes('not supported');
}
// ─────────────────────────────────────────────────────────────────────────────
// AiBalancer
// ─────────────────────────────────────────────────────────────────────────────
class AiBalancer {
    constructor() {
        this.currentActiveId = null;
        this.failures = new Map();
        // Notification throttle — 1 event per type per school per 5 min
        this.lastNotif = new Map();
        this.NOTIF_THROTTLE = 300000;
        this.COOLDOWN = 60000;
        this.QUOTA_COOLDOWN = 300000;
    }
    static getInstance() {
        if (!AiBalancer._instance)
            AiBalancer._instance = new AiBalancer();
        return AiBalancer._instance;
    }
    async getStatus(schoolId) {
        try {
            const { systemService } = await Promise.resolve().then(() => __importStar(require('../../modules/system/system.service')));
            const settings = await systemService.getSettings(schoolId);
            // 1. Priorité absolue à l'override
            if (settings.aiOverrideConfigId) {
                const adminConfigs = this.loadAdminConfigs(settings);
                const resolved = await this.buildCascade(adminConfigs);
                const ov = resolved.find(r => r.adminId === settings.aiOverrideConfigId);
                if (ov)
                    return { currentActiveId: ov.id, current: ov, isOverride: true };
            }
            // 2. Sinon, check Redis/Mémoire
            const { redisConnection } = await Promise.resolve().then(() => __importStar(require('../../core/config/redis')));
            const cached = await redisConnection.get('ai_balancer:current_active_id').catch(() => null);
            const activeId = cached || this.currentActiveId;
            if (activeId) {
                const adminConfigs = this.loadAdminConfigs(settings);
                const resolved = await this.buildCascade(adminConfigs);
                const active = resolved.find(r => r.id === activeId);
                if (active)
                    return { currentActiveId: activeId, current: active };
                return { currentActiveId: activeId }; // Fallback si non trouvé dans la cascade actuelle
            }
            // 3. Sinon, premier de la cascade
            if (settings.aiEnabled) {
                const adminConfigs = this.loadAdminConfigs(settings);
                const resolved = await this.buildCascade(adminConfigs);
                if (resolved.length > 0)
                    return { currentActiveId: resolved[0].id, current: resolved[0] };
            }
        }
        catch (e) {
            console.error("AiBalancer.getStatus error:", e);
        }
        return { currentActiveId: null };
    }
    async clearCache() {
        this.currentActiveId = null;
        try {
            const { redisConnection } = await Promise.resolve().then(() => __importStar(require('../../core/config/redis')));
            await redisConnection.del('ai_balancer:current_active_id').catch(() => { });
        }
        catch (e) { }
    }
    // ── Main entry point ──────────────────────────────────────────────────────
    async callAI(prompt, schoolId) {
        const settings = await system_service_1.systemService.getSettings(schoolId);
        if (!settings.aiEnabled)
            throw new Error('AI disabled by system settings');
        const adminConfigs = this.loadAdminConfigs(settings);
        // Build cascade: dynamically discover top-5 models per provider
        const resolved = await this.buildCascade(adminConfigs);
        if (resolved.length === 0)
            throw new Error('No AI config found. Add a provider in system settings.');
        // ── Fast-path: skip cascade rebuild, try last successful model first ──────
        // On success this avoids iterating the full cascade (lower latency).
        if (this.currentActiveId) {
            const fast = resolved.find(r => r.id === this.currentActiveId);
            const state = fast ? this.failures.get(fast.id) : undefined;
            const cd = state?.isQuota ? this.QUOTA_COOLDOWN : this.COOLDOWN;
            if (fast && !state?.permanent && (!state || Date.now() - state.lastFail >= cd)) {
                try {
                    console.log(`⚡ Fast-path: ${fast.name} (${fast.model})`);
                    const content = await this.call(fast, prompt);
                    const { redisConnection } = await Promise.resolve().then(() => __importStar(require('../../core/config/redis')));
                    await redisConnection.set('ai_balancer:current_active_id', fast.id, 'EX', 3600).catch(() => { });
                    return { content, provider: fast.provider, model: fast.model };
                }
                catch (err) {
                    const quota = isQuotaErr(err);
                    const notFound = isNotFoundErr(err);
                    this.failures.set(fast.id, { lastFail: Date.now(), count: 1, isQuota: quota, permanent: notFound });
                    this.currentActiveId = null;
                    console.warn(`⚡ Fast-path failed (${fast.model}), cascading:`, err instanceof Error ? err.message.slice(0, 80) : err);
                }
            }
        }
        // Manual override
        if (settings.aiOverrideConfigId) {
            const ov = resolved.find(r => r.adminId === settings.aiOverrideConfigId);
            if (ov && !this.failures.get(ov.id)?.permanent) {
                try {
                    const content = await this.call(ov, prompt);
                    this.currentActiveId = ov.id;
                    const { redisConnection } = await Promise.resolve().then(() => __importStar(require('../../core/config/redis')));
                    await redisConnection.set('ai_balancer:current_active_id', ov.id, 'EX', 3600).catch(() => { });
                    return { content, provider: ov.provider, model: ov.model };
                }
                catch (err) {
                    console.error(`❌ Override failed (${ov.name}):`, err);
                }
            }
        }
        const failedLabels = [];
        let lastError = null;
        let allSkipped = true;
        for (const cfg of resolved) {
            const state = this.failures.get(cfg.id);
            if (state?.permanent) {
                console.log(`🚫 Skip ${cfg.name} — 404 permanent`);
                continue;
            }
            if (state) {
                const cd = state.isQuota ? this.QUOTA_COOLDOWN : this.COOLDOWN;
                if (Date.now() - state.lastFail < cd) {
                    const s = Math.round((state.lastFail + cd - Date.now()) / 1000);
                    console.log(`⏭️  Skip ${cfg.name} — cooldown ~${s}s`);
                    continue;
                }
            }
            try {
                console.log(`🤖 [${cfg.provider}] Trying ${cfg.name} (${cfg.model})…`);
                const content = await this.call(cfg, prompt);
                allSkipped = false;
                this.currentActiveId = cfg.id;
                const { redisConnection } = await Promise.resolve().then(() => __importStar(require('../../core/config/redis')));
                await redisConnection.set('ai_balancer:current_active_id', cfg.id, 'EX', 3600).catch(() => { });
                this.failures.delete(cfg.id);
                return { content, provider: cfg.provider, model: cfg.model };
            }
            catch (err) {
                allSkipped = false;
                lastError = err;
                const quota = isQuotaErr(err);
                const notFound = isNotFoundErr(err);
                this.failures.set(cfg.id, {
                    lastFail: Date.now(), count: (state?.count || 0) + 1,
                    isQuota: quota, permanent: notFound,
                });
                const icon = notFound ? '🚫' : quota ? '⚠️' : '❌';
                console.warn(`${icon} ${cfg.name}: ${err instanceof Error ? err.message.slice(0, 120) : err}`);
                if (quota || notFound)
                    failedLabels.push(`${cfg.model}(${quota ? 'quota' : '404'})`);
                if (quota) {
                    const next = resolved.find(r => {
                        if (r.id === cfg.id)
                            return false;
                        const s = this.failures.get(r.id);
                        return !s || (!s.permanent && Date.now() - s.lastFail >= (s.isQuota ? this.QUOTA_COOLDOWN : this.COOLDOWN));
                    });
                    await this.notifyOnce(schoolId, 'quota-switch', () => this.sendAdminNotif(schoolId, '⚡ Basculement IA — Quota atteint', `**${cfg.name}** (${cfg.model}) a atteint sa limite. ` +
                        `Bascule vers : **${next ? next.name : 'aucun — service dégradé'}**. ` +
                        `Erreur : ${err instanceof Error ? err.message.slice(0, 100) : err}`)).catch(console.error);
                }
            }
        }
        if (allSkipped) {
            const soonest = this.soonestRetry(resolved);
            throw new Error(`AI Balancer: tous les modèles en cooldown. Retry dans ~${Math.max(0, Math.round(soonest / 1000))}s`);
        }
        const msg = lastError instanceof Error ? lastError.message : 'Unknown';
        await this.notifyOnce(schoolId, 'total-failure', () => this.sendAdminNotif(schoolId, '🚨 Panne IA — Tous les fournisseurs ont échoué', `${resolved.length} modèles essayés. Échecs : ${failedLabels.join(', ') || '—'}. ` +
            `Dernière erreur : ${msg}. Vérifiez vos clés API et quotas.`)).catch(console.error);
        throw new Error(`AI Balancer: tous les providers ont échoué. Dernière erreur: ${msg}`);
    }
    // ── Config loader ─────────────────────────────────────────────────────────
    loadAdminConfigs(settings) {
        const db = settings.aiConfigs || [];
        const dbProviders = new Set(db.map(c => c.provider));
        const maxPriority = db.reduce((mx, c) => Math.max(mx, c.priority ?? 0), 0);
        // Always append env providers not already covered by a DB config.
        // This ensures GROQ_API_KEY is always in the cascade even when DB has Gemini.
        const envExtra = [];
        if (!dbProviders.has('GEMINI') && process.env.GEMINI_API_KEY)
            envExtra.push({ id: 'env-gemini', name: 'Gemini (env)', provider: 'GEMINI', apiKey: process.env.GEMINI_API_KEY, preferredModel: 'gemini-2.5-flash', priority: maxPriority + 1 });
        if (!dbProviders.has('GROQ') && process.env.GROQ_API_KEY)
            envExtra.push({ id: 'env-groq', name: 'Groq (env)', provider: 'GROQ', apiKey: process.env.GROQ_API_KEY, priority: maxPriority + 2 });
        return [...db, ...envExtra].sort((a, b) => a.priority - b.priority);
    }
    // ── Dynamic cascade builder ───────────────────────────────────────────────
    /**
     * For each admin config, queries the provider's model-list API (cached 1h)
     * and returns the top-5 text models. PreferredModel is injected at position 0.
     * Global sort: adminPriority * 100 + modelRank → all P1 models before P2 models.
     */
    async buildCascade(adminConfigs) {
        const resolved = [];
        for (const admin of adminConfigs) {
            // Get top-5 discovered models for this provider + key
            const discovered = await ModelDiscovery_1.modelDiscovery.getTopModels(admin.provider, admin.apiKey, 5);
            // Build ordered list: preferredModel at top (even if not in discovered)
            const ordered = [...discovered];
            if (admin.preferredModel) {
                const idx = ordered.findIndex(m => m.id === admin.preferredModel);
                if (idx > 0) {
                    // Move to front
                    const [item] = ordered.splice(idx, 1);
                    ordered.unshift(item);
                }
                else if (idx === -1) {
                    // Not in discovered list — prepend manually
                    ordered.unshift({ id: admin.preferredModel, name: admin.preferredModel, score: 999 });
                }
            }
            ordered.forEach((m, rank) => {
                resolved.push({
                    id: `${admin.id}::${m.id}`,
                    name: `${admin.name} › ${m.name}`,
                    provider: admin.provider,
                    apiKey: admin.apiKey,
                    model: m.id,
                    priority: admin.priority * 100 + rank,
                    adminId: admin.id,
                });
            });
        }
        return resolved.sort((a, b) => a.priority - b.priority);
    }
    // ── HTTP dispatchers ──────────────────────────────────────────────────────
    async call(cfg, prompt) {
        switch (cfg.provider) {
            case 'GEMINI': return this.callGemini(cfg.apiKey, cfg.model, prompt);
            case 'GROQ': return this.callGroq(cfg.apiKey, cfg.model, prompt);
            case 'OPENAI': return this.callOpenAI(cfg.apiKey, cfg.model, prompt);
            case 'ANTHROPIC': return this.callAnthropic(cfg.apiKey, cfg.model, prompt);
        }
    }
    async callGemini(key, model, prompt) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
        if (!res.ok)
            throw new Error(`Gemini error: ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
        const d = (await res.json());
        if ('error' in d) {
            const e = d['error'];
            throw new Error(`Gemini API: ${e.status ?? ''} ${e.message ?? ''}`);
        }
        const parts = (d['candidates']?.[0]?.['content']?.['parts']);
        return typeof parts?.[0]?.['text'] === 'string' ? parts[0]['text'] : '';
    }
    async callGroq(key, model, prompt) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
        });
        if (!res.ok)
            throw new Error(`Groq error: ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
        const d = (await res.json());
        return String((d['choices']?.[0]?.['message']?.['content']) ?? '');
    }
    async callOpenAI(key, model, prompt) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
        });
        if (!res.ok)
            throw new Error(`OpenAI error: ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
        const d = (await res.json());
        return String((d['choices']?.[0]?.['message']?.['content']) ?? '');
    }
    async callAnthropic(key, model, prompt) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': key, 'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model, max_tokens: 2048, messages: [{ role: 'user', content: prompt }] }),
        });
        if (!res.ok)
            throw new Error(`Anthropic error: ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
        const d = (await res.json());
        const content = d['content'];
        return content?.find(b => b.type === 'text')?.text ?? '';
    }
    // ── Notifications (throttled) ─────────────────────────────────────────────
    async notifyOnce(schoolId, event, fn) {
        const key = `${schoolId}:${event}`;
        const last = this.lastNotif.get(key) ?? 0;
        if (Date.now() - last < this.NOTIF_THROTTLE) {
            console.log(`🔕 Notif throttled (${event})`);
            return;
        }
        await fn();
        this.lastNotif.set(key, Date.now());
    }
    async sendAdminNotif(schoolId, title, message) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require('../../core/database/prisma')));
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN', schoolId }, select: { id: true } });
        for (const a of admins) {
            await prisma.notification.create({ data: { title, message, type: 'AI_FAILURE', userId: a.id, schoolId } });
        }
        console.log(`📬 [${title.slice(0, 35)}] → ${admins.length} admin(s)`);
    }
    // ── Utils ─────────────────────────────────────────────────────────────────
    soonestRetry(resolved) {
        let min = Infinity;
        for (const r of resolved) {
            const s = this.failures.get(r.id);
            if (!s || s.permanent)
                continue;
            const cd = s.isQuota ? this.QUOTA_COOLDOWN : this.COOLDOWN;
            const eta = s.lastFail + cd - Date.now();
            if (eta < min)
                min = eta;
        }
        return min === Infinity ? 0 : min;
    }
}
exports.AiBalancer = AiBalancer;
exports.aiBalancer = AiBalancer.getInstance();
//# sourceMappingURL=AiBalancer.js.map