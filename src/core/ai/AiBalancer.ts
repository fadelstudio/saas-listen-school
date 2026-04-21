import { systemService } from '../../modules/system/system.service';
import { modelDiscovery, SupportedProvider } from './ModelDiscovery';

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export interface AiResponse { content: string; provider: string; model: string; }

/**
 * What admins store in systemSettings.aiConfigs[].
 * They only manage: provider, apiKey, optional preferredModel, priority.
 * The balancer auto-discovers the full model cascade behind the scenes.
 */
export interface AdminAiConfig {
  id:              string;
  name:            string;
  provider:        SupportedProvider;
  apiKey:          string;
  preferredModel?: string; // optional — tried first before auto-discovered cascade
  priority:        number; // lower = higher priority (across providers)
}

// Internal fully-resolved entry (one model per entry)
interface ResolvedConfig {
  id:       string;           // `${adminId}::${model}`
  name:     string;           // display label
  provider: SupportedProvider;
  apiKey:   string;
  model:    string;
  priority: number;           // global sort key
  adminId:  string;
}

type FailureState = { lastFail: number; count: number; isQuota: boolean; permanent: boolean; };

// ─────────────────────────────────────────────────────────────────────────────
// Error classifiers
// ─────────────────────────────────────────────────────────────────────────────

function isQuotaErr(err: unknown): boolean {
  const m = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return m.includes('429') || m.includes('resource_exhausted') || m.includes('quota') ||
         m.includes('rate limit') || m.includes('ratelimit') || m.includes('token limit');
}
function isNotFoundErr(err: unknown): boolean {
  const m = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return m.includes('404') || m.includes('not found') || m.includes('not supported');
}

// ─────────────────────────────────────────────────────────────────────────────
// AiBalancer
// ─────────────────────────────────────────────────────────────────────────────

export class AiBalancer {
  private static _instance: AiBalancer;
  private currentActiveId: string | null = null;
  private failures = new Map<string, FailureState>();

  // Notification throttle — 1 event per type per school per 5 min
  private lastNotif = new Map<string, number>();
  private readonly NOTIF_THROTTLE = 300_000;
  private readonly COOLDOWN        = 60_000;
  private readonly QUOTA_COOLDOWN  = 300_000;

  private constructor() {}
  static getInstance(): AiBalancer {
    if (!AiBalancer._instance) AiBalancer._instance = new AiBalancer();
    return AiBalancer._instance;
  }

  getStatus() { return { currentActiveId: this.currentActiveId }; }

  // ── Main entry point ──────────────────────────────────────────────────────

  async callAI(prompt: string, schoolId: string): Promise<AiResponse> {
    const settings = await systemService.getSettings(schoolId);
    if (!settings.aiEnabled) throw new Error('AI disabled by system settings');

    const adminConfigs = this.loadAdminConfigs(settings);
    // Build cascade: dynamically discover top-5 models per provider
    const resolved = await this.buildCascade(adminConfigs);

    if (resolved.length === 0) throw new Error('No AI config found. Add a provider in system settings.');

    // ── Fast-path: skip cascade rebuild, try last successful model first ──────
    // On success this avoids iterating the full cascade (lower latency).
    if (this.currentActiveId) {
      const fast  = resolved.find(r => r.id === this.currentActiveId);
      const state = fast ? this.failures.get(fast.id) : undefined;
      const cd    = state?.isQuota ? this.QUOTA_COOLDOWN : this.COOLDOWN;
      if (fast && !state?.permanent && (!state || Date.now() - state.lastFail >= cd)) {
        try {
          console.log(`⚡ Fast-path: ${fast.name} (${fast.model})`);
          const content = await this.call(fast, prompt);
          return { content, provider: fast.provider, model: fast.model };
        } catch (err) {
          const quota    = isQuotaErr(err);
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
          return { content, provider: ov.provider, model: ov.model };
        } catch (err) { console.error(`❌ Override failed (${ov.name}):`, err); }
      }
    }

    const failedLabels: string[] = [];
    let lastError: unknown = null;
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
        this.failures.delete(cfg.id);
        return { content, provider: cfg.provider, model: cfg.model };

      } catch (err) {
        allSkipped = false;
        lastError = err;
        const quota    = isQuotaErr(err);
        const notFound = isNotFoundErr(err);

        this.failures.set(cfg.id, {
          lastFail: Date.now(), count: (state?.count || 0) + 1,
          isQuota: quota, permanent: notFound,
        });

        const icon = notFound ? '🚫' : quota ? '⚠️' : '❌';
        console.warn(`${icon} ${cfg.name}: ${err instanceof Error ? err.message.slice(0, 120) : err}`);

        if (quota || notFound) failedLabels.push(`${cfg.model}(${quota ? 'quota' : '404'})`);

        if (quota) {
          const next = resolved.find(r => {
            if (r.id === cfg.id) return false;
            const s = this.failures.get(r.id);
            return !s || (!s.permanent && Date.now() - s.lastFail >= (s.isQuota ? this.QUOTA_COOLDOWN : this.COOLDOWN));
          });
          await this.notifyOnce(schoolId, 'quota-switch', () =>
            this.sendAdminNotif(schoolId,
              '⚡ Basculement IA — Quota atteint',
              `**${cfg.name}** (${cfg.model}) a atteint sa limite. ` +
              `Bascule vers : **${next ? next.name : 'aucun — service dégradé'}**. ` +
              `Erreur : ${err instanceof Error ? err.message.slice(0, 100) : err}`
            )
          ).catch(console.error);
        }
      }
    }

    if (allSkipped) {
      const soonest = this.soonestRetry(resolved);
      throw new Error(`AI Balancer: tous les modèles en cooldown. Retry dans ~${Math.max(0, Math.round(soonest / 1000))}s`);
    }

    const msg = lastError instanceof Error ? lastError.message : 'Unknown';
    await this.notifyOnce(schoolId, 'total-failure', () =>
      this.sendAdminNotif(schoolId,
        '🚨 Panne IA — Tous les fournisseurs ont échoué',
        `${resolved.length} modèles essayés. Échecs : ${failedLabels.join(', ') || '—'}. ` +
        `Dernière erreur : ${msg}. Vérifiez vos clés API et quotas.`
      )
    ).catch(console.error);

    throw new Error(`AI Balancer: tous les providers ont échoué. Dernière erreur: ${msg}`);
  }

  // ── Config loader ─────────────────────────────────────────────────────────

  private loadAdminConfigs(settings: any): AdminAiConfig[] {
    const db: AdminAiConfig[] = (settings.aiConfigs as AdminAiConfig[]) || [];
    const dbProviders = new Set(db.map(c => c.provider));
    const maxPriority = db.reduce((mx, c) => Math.max(mx, c.priority ?? 0), 0);

    // Always append env providers not already covered by a DB config.
    // This ensures GROQ_API_KEY is always in the cascade even when DB has Gemini.
    const envExtra: AdminAiConfig[] = [];
    if (!dbProviders.has('GEMINI') && process.env.GEMINI_API_KEY)
      envExtra.push({ id: 'env-gemini', name: 'Gemini (env)', provider: 'GEMINI', apiKey: process.env.GEMINI_API_KEY, preferredModel: 'gemini-2.5-flash', priority: maxPriority + 1 });
    if (!dbProviders.has('GROQ') && process.env.GROQ_API_KEY)
      envExtra.push({ id: 'env-groq',   name: 'Groq (env)',   provider: 'GROQ',   apiKey: process.env.GROQ_API_KEY,   priority: maxPriority + 2 });

    return [...db, ...envExtra].sort((a, b) => a.priority - b.priority);
  }

  // ── Dynamic cascade builder ───────────────────────────────────────────────

  /**
   * For each admin config, queries the provider's model-list API (cached 1h)
   * and returns the top-5 text models. PreferredModel is injected at position 0.
   * Global sort: adminPriority * 100 + modelRank → all P1 models before P2 models.
   */
  private async buildCascade(adminConfigs: AdminAiConfig[]): Promise<ResolvedConfig[]> {
    const resolved: ResolvedConfig[] = [];

    for (const admin of adminConfigs) {
      // Get top-5 discovered models for this provider + key
      const discovered = await modelDiscovery.getTopModels(admin.provider, admin.apiKey, 5);

      // Build ordered list: preferredModel at top (even if not in discovered)
      const ordered = [...discovered];
      if (admin.preferredModel) {
        const idx = ordered.findIndex(m => m.id === admin.preferredModel);
        if (idx > 0) {
          // Move to front
          const [item] = ordered.splice(idx, 1);
          ordered.unshift(item);
        } else if (idx === -1) {
          // Not in discovered list — prepend manually
          ordered.unshift({ id: admin.preferredModel, name: admin.preferredModel, score: 999 });
        }
      }

      ordered.forEach((m, rank) => {
        resolved.push({
          id:       `${admin.id}::${m.id}`,
          name:     `${admin.name} › ${m.name}`,
          provider: admin.provider,
          apiKey:   admin.apiKey,
          model:    m.id,
          priority: admin.priority * 100 + rank,
          adminId:  admin.id,
        });
      });
    }

    return resolved.sort((a, b) => a.priority - b.priority);
  }

  // ── HTTP dispatchers ──────────────────────────────────────────────────────

  private async call(cfg: ResolvedConfig, prompt: string): Promise<string> {
    switch (cfg.provider) {
      case 'GEMINI':    return this.callGemini(cfg.apiKey, cfg.model, prompt);
      case 'GROQ':      return this.callGroq(cfg.apiKey, cfg.model, prompt);
      case 'OPENAI':    return this.callOpenAI(cfg.apiKey, cfg.model, prompt);
      case 'ANTHROPIC': return this.callAnthropic(cfg.apiKey, cfg.model, prompt);
    }
  }

  private async callGemini(key: string, model: string, prompt: string): Promise<string> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
    );
    if (!res.ok) throw new Error(`Gemini error: ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
    const d = (await res.json()) as Record<string, unknown>;
    if ('error' in d) {
      const e = d['error'] as { message?: string; status?: string };
      throw new Error(`Gemini API: ${e.status ?? ''} ${e.message ?? ''}`);
    }
    const parts = ((d['candidates'] as any[])?.[0]?.['content']?.['parts']) as any[] | undefined;
    return typeof parts?.[0]?.['text'] === 'string' ? parts[0]['text'] : '';
  }

  private async callGroq(key: string, model: string, prompt: string): Promise<string> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`Groq error: ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
    const d = (await res.json()) as Record<string, unknown>;
    return String(((d['choices'] as any[])?.[0]?.['message']?.['content']) ?? '');
  }

  private async callOpenAI(key: string, model: string, prompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
    const d = (await res.json()) as Record<string, unknown>;
    return String(((d['choices'] as any[])?.[0]?.['message']?.['content']) ?? '');
  }

  private async callAnthropic(key: string, model: string, prompt: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key, 'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, max_tokens: 2048, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`Anthropic error: ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
    const d = (await res.json()) as Record<string, unknown>;
    const content = d['content'] as { type: string; text: string }[] | undefined;
    return content?.find(b => b.type === 'text')?.text ?? '';
  }

  // ── Notifications (throttled) ─────────────────────────────────────────────

  private async notifyOnce(schoolId: string, event: string, fn: () => Promise<void>): Promise<void> {
    const key  = `${schoolId}:${event}`;
    const last = this.lastNotif.get(key) ?? 0;
    if (Date.now() - last < this.NOTIF_THROTTLE) {
      console.log(`🔕 Notif throttled (${event})`);
      return;
    }
    await fn();
    this.lastNotif.set(key, Date.now());
  }

  private async sendAdminNotif(schoolId: string, title: string, message: string): Promise<void> {
    const { prisma } = await import('../../core/database/prisma');
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', schoolId }, select: { id: true } });
    for (const a of admins) {
      await prisma.notification.create({ data: { title, message, type: 'AI_FAILURE', userId: a.id, schoolId } as any });
    }
    console.log(`📬 [${title.slice(0, 35)}] → ${admins.length} admin(s)`);
  }

  // ── Utils ─────────────────────────────────────────────────────────────────

  private soonestRetry(resolved: ResolvedConfig[]): number {
    let min = Infinity;
    for (const r of resolved) {
      const s = this.failures.get(r.id);
      if (!s || s.permanent) continue;
      const cd  = s.isQuota ? this.QUOTA_COOLDOWN : this.COOLDOWN;
      const eta = s.lastFail + cd - Date.now();
      if (eta < min) min = eta;
    }
    return min === Infinity ? 0 : min;
  }
}

export const aiBalancer = AiBalancer.getInstance();
