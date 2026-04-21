// ─────────────────────────────────────────────────────────────────────────────
// ModelDiscovery — queries each provider's model-list API and returns the
// top-5 text-generation models, ranked by a scoring heuristic.
// Results are cached 1 hour per (provider + apiKey).
// Falls back to hardcoded top-5 when the API is unreachable.
// ─────────────────────────────────────────────────────────────────────────────

export type SupportedProvider = 'GEMINI' | 'GROQ' | 'OPENAI' | 'ANTHROPIC';

export interface DiscoveredModel {
  id:    string;
  name:  string;
  score: number; // higher = tried first in cascade
}

// ── Hardcoded fallback top-5 per provider (verified stable IDs) ───────────────
export const FALLBACK_TOP5: Record<SupportedProvider, DiscoveredModel[]> = {
  GEMINI: [
    { id: 'gemini-2.5-flash',      name: 'Gemini 2.5 Flash',      score: 100 },
    { id: 'gemini-2.0-flash',      name: 'Gemini 2.0 Flash',      score: 90  },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', score: 80  },
    { id: 'gemini-1.5-flash',      name: 'Gemini 1.5 Flash',      score: 70  },
    { id: 'gemma-3-27b-it',        name: 'Gemma 3 27B',           score: 60  },
  ],
  GROQ: [
    { id: 'llama3-70b-8192',           name: 'Llama 3 70B',          score: 100 },
    { id: 'llama3-8b-8192',            name: 'Llama 3 8B',           score: 85  },
    { id: 'mixtral-8x7b-32768',        name: 'Mixtral 8x7B',         score: 80  },
    { id: 'gemma2-9b-it',              name: 'Gemma 2 9B',           score: 70  },
    { id: 'llama-3.1-8b-instant',      name: 'Llama 3.1 8B Instant', score: 60  },
  ],
  OPENAI: [
    { id: 'gpt-4o-mini',   name: 'GPT-4o Mini',   score: 100 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', score: 90  },
    { id: 'gpt-4o',        name: 'GPT-4o',         score: 80  },
    { id: 'gpt-4-turbo',   name: 'GPT-4 Turbo',   score: 70  },
    { id: 'gpt-4',         name: 'GPT-4',          score: 60  },
  ],
  ANTHROPIC: [
    { id: 'claude-3-5-haiku-20241022',  name: 'Claude 3.5 Haiku',  score: 100 },
    { id: 'claude-3-haiku-20240307',    name: 'Claude 3 Haiku',    score: 90  },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', score: 80  },
    { id: 'claude-3-sonnet-20240229',   name: 'Claude 3 Sonnet',   score: 70  },
    { id: 'claude-3-opus-20240229',     name: 'Claude 3 Opus',     score: 60  },
  ],
};

export class ModelDiscovery {
  private static _instance: ModelDiscovery;
  private cache = new Map<string, { models: DiscoveredModel[]; at: number }>();
  private readonly TTL = 3_600_000; // 1 hour

  private constructor() {}
  static getInstance(): ModelDiscovery {
    if (!ModelDiscovery._instance) ModelDiscovery._instance = new ModelDiscovery();
    return ModelDiscovery._instance;
  }

  /**
   * Returns up to `limit` models for a provider, ranked by score (best first).
   * Tries live discovery, falls back to hardcoded FALLBACK_TOP5.
   */
  async getTopModels(provider: SupportedProvider, apiKey: string, limit = 5): Promise<DiscoveredModel[]> {
    const key    = `${provider}:${this.hash(apiKey)}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.at < this.TTL) return cached.models.slice(0, limit);

    try {
      const models = await this.discover(provider, apiKey);
      this.cache.set(key, { models, at: Date.now() });
      console.log(`🔍 Discovered ${models.length} models for ${provider}, using top ${limit}`);
      return models.slice(0, limit);
    } catch (err) {
      console.warn(`⚠️  Model discovery failed for ${provider} (using fallback):`, err instanceof Error ? err.message : err);
      const fb = FALLBACK_TOP5[provider];
      this.cache.set(key, { models: fb, at: Date.now() });
      return fb.slice(0, limit);
    }
  }

  // ── Cache invalidation ────────────────────────────────────────────────────
  invalidate(provider: SupportedProvider, apiKey: string) {
    this.cache.delete(`${provider}:${this.hash(apiKey)}`);
  }

  // ── Provider discovery ────────────────────────────────────────────────────

  private async discover(provider: SupportedProvider, apiKey: string): Promise<DiscoveredModel[]> {
    switch (provider) {
      case 'GEMINI':    return this.discoverGemini(apiKey);
      case 'GROQ':      return this.discoverGroq(apiKey);
      case 'OPENAI':    return this.discoverOpenAI(apiKey);
      case 'ANTHROPIC': return this.discoverAnthropic(apiKey);
    }
  }

  // ── Gemini ────────────────────────────────────────────────────────────────

  private async discoverGemini(apiKey: string): Promise<DiscoveredModel[]> {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) throw new Error(`Gemini list ${res.status}`);
    const data = (await res.json()) as { models?: Record<string, unknown>[] };

    return (data.models ?? [])
      .filter(m => {
        const methods = m['supportedGenerationMethods'];
        const name    = String(m['name'] ?? '');
        return Array.isArray(methods) &&
          methods.includes('generateContent') &&
          // Exclude non-text models: embedding, TTS, image-gen, video, audio
          !/(embed|tts|imagen|veo|lyria|aqa|dialog|-image$|image-gen|imagegeneration|audio-dialog)/i.test(name) &&
          // Only include text-first model families
          /(gemini|gemma)/.test(name);
      })
      .map(m => {
        const id = String(m['name'] ?? '').replace('models/', '');
        return { id, name: String(m['displayName'] ?? id), score: this.scoreGemini(id) };
      })
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private scoreGemini(id: string): number {
    if (/embed|tts|imagen|veo|lyria|aqa/.test(id)) return 0;
    let s = 0;
    // Version
    if (id.includes('2.5'))      s += 50;
    else if (id.includes('2.0')) s += 40;
    else if (id.includes('1.5')) s += 30;
    else if (id.includes('gemma-3') || id.includes('gemma-4')) s += 20;
    else if (id.includes('gemma')) s += 10;
    // Tier (Gemini models)
    if (!id.includes('gemma')) {
      if (id.includes('flash') && !id.includes('lite') && !id.includes('8b')) s += 30;
      else if (id.includes('flash-lite') || id.includes('flash-8b')) s += 20;
      else if (id.includes('pro'))  s += 25;
    } else {
      // Gemma size
      if      (id.includes('27b')) s += 20;
      else if (id.includes('12b')) s += 16;
      else if (id.includes('4b'))  s += 12;
      else if (id.includes('1b'))  s += 8;
    }
    if (!id.includes('preview') && !id.includes('exp')) s += 5; // stable ID bonus
    return s;
  }

  // ── Groq ──────────────────────────────────────────────────────────────────

  private async discoverGroq(apiKey: string): Promise<DiscoveredModel[]> {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`Groq list ${res.status}`);
    const data = (await res.json()) as { data?: Record<string, unknown>[] };

    return (data.data ?? [])
      .map(m => ({ id: String(m['id'] ?? ''), name: String(m['id'] ?? ''), score: this.scoreGroq(String(m['id'] ?? '')) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private scoreGroq(id: string): number {
    if (/whisper|distil|guard|tool-use/.test(id)) return 0;
    let s = 0;
    if (id.includes('llama3') || id.includes('llama-3')) {
      s += 50;
      if (id.includes('70b')) s += 40; else if (id.includes('8b')) s += 25;
      if (id.includes('3.3')) s += 10; else if (id.includes('3.2')) s += 8; else if (id.includes('3.1')) s += 6;
    } else if (id.includes('mixtral')) {
      s += 45;
      if (id.includes('8x22b')) s += 25; else if (id.includes('8x7b')) s += 20;
    } else if (id.includes('deepseek')) {
      s += 40;
    } else if (id.includes('qwen')) {
      s += 35;
      if (id.includes('32b')) s += 20;
    } else if (id.includes('gemma')) {
      s += 30;
      if (id.includes('9b') || id.includes('7b')) s += 15;
    }
    if (id.includes('instant')) s -= 5;
    return s;
  }

  // ── OpenAI ────────────────────────────────────────────────────────────────

  private async discoverOpenAI(apiKey: string): Promise<DiscoveredModel[]> {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`OpenAI list ${res.status}`);
    const data = (await res.json()) as { data?: Record<string, unknown>[] };

    return (data.data ?? [])
      .map(m => ({ id: String(m['id'] ?? ''), name: String(m['id'] ?? ''), score: this.scoreOpenAI(String(m['id'] ?? '')) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private scoreOpenAI(id: string): number {
    if (/instruct|embed|whisper|dall|tts|:ft-|0301|0314|babbage|davinci|curie|ada/.test(id)) return 0;
    if (id === 'gpt-4o-mini')          return 100;
    if (id.startsWith('gpt-4o-mini'))  return 95;
    if (id === 'gpt-3.5-turbo')        return 90;
    if (id.startsWith('gpt-3.5'))      return 85;
    if (id === 'gpt-4o')               return 80;
    if (id.startsWith('gpt-4o'))       return 75;
    if (id === 'gpt-4-turbo')          return 70;
    if (id.startsWith('gpt-4-turbo'))  return 65;
    if (id === 'gpt-4')                return 60;
    if (id.startsWith('gpt-4'))        return 55;
    return 0;
  }

  // ── Anthropic ─────────────────────────────────────────────────────────────

  private async discoverAnthropic(apiKey: string): Promise<DiscoveredModel[]> {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    });
    if (!res.ok) throw new Error(`Anthropic list ${res.status}`);
    const data = (await res.json()) as { data?: Record<string, unknown>[] };

    return (data.data ?? [])
      .map(m => ({
        id:    String(m['id'] ?? ''),
        name:  String(m['display_name'] ?? m['id'] ?? ''),
        score: this.scoreAnthropic(String(m['id'] ?? '')),
      }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private scoreAnthropic(id: string): number {
    if (!id.includes('claude')) return 0;
    let s = 0;
    if      (id.includes('haiku'))  s += 50; // cheapest/fastest → first in cascade
    else if (id.includes('sonnet')) s += 40;
    else if (id.includes('opus'))   s += 30;
    if      (id.includes('3-5') || id.includes('3.5')) s += 20;
    else if (id.includes('-3-'))    s += 10;
    return s;
  }

  // ── Utils ─────────────────────────────────────────────────────────────────

  private hash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return Math.abs(h).toString(16);
  }
}

export const modelDiscovery = ModelDiscovery.getInstance();
