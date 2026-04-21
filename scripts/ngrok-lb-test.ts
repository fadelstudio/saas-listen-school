/**
 * ngrok-lb-test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Test du load-balancing entre deux tunnels ngrok pointant sur la même école.
 *
 * Usage:
 *   npx ts-node scripts/ngrok-lb-test.ts
 *
 * Variables attendues dans .env :
 *   NGROK_TUNNEL_1  : première URL ngrok  (ex: https://xxxx.ngrok-free.app)
 *   NGROK_TUNNEL_2  : deuxième URL ngrok  (ex: https://yyyy.ngrok-free.app)
 *   NGROK_TARGET_SCHOOL_SLUG : slug de l'école à tester (ex: afi-default-school)
 *   JWT_TEST_TOKEN  : token JWT admin valide pour les requêtes authentifiées
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';

const TUNNEL_1 = process.env.NGROK_TUNNEL_1;
const TUNNEL_2 = process.env.NGROK_TUNNEL_2;
const SCHOOL_SLUG = process.env.NGROK_TARGET_SCHOOL_SLUG ?? 'afi-default-school';
const TOKEN = process.env.JWT_TEST_TOKEN ?? '';

if (!TUNNEL_1 || !TUNNEL_2) {
  console.error('❌  NGROK_TUNNEL_1 et NGROK_TUNNEL_2 doivent être définis dans .env');
  process.exit(1);
}

// ─── Round-robin balancer ────────────────────────────────────────────────────

const tunnels = [TUNNEL_1, TUNNEL_2];
let roundRobinIdx = 0;

function nextTunnel(): string {
  const t = tunnels[roundRobinIdx % tunnels.length];
  roundRobinIdx++;
  return t;
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────

interface TestResult {
  tunnel: string;
  path: string;
  status: number;
  latencyMs: number;
  ok: boolean;
  body?: string;
}

async function testEndpoint(path: string): Promise<TestResult> {
  const tunnel = nextTunnel();
  const url = `${tunnel}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-school-slug': SCHOOL_SLUG,
  };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  const start = Date.now();
  try {
    const res = await fetch(url, { headers });
    const latencyMs = Date.now() - start;
    const body = await res.text().catch(() => '');
    return { tunnel, path, status: res.status, latencyMs, ok: res.ok, body: body.slice(0, 200) };
  } catch (err) {
    return {
      tunnel,
      path,
      status: 0,
      latencyMs: Date.now() - start,
      ok: false,
      body: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Test suite ──────────────────────────────────────────────────────────────

const ENDPOINTS = [
  '/api/system/settings/public',
  '/api/ai/status',
  '/api/notifications',
];

const ROUNDS = 6; // 3 rounds × 2 tunnels = 6 requests total per endpoint

async function run() {
  console.log('\n🚀  Test de load-balancing ngrok\n');
  console.log(`   Tunnel 1 : ${TUNNEL_1}`);
  console.log(`   Tunnel 2 : ${TUNNEL_2}`);
  console.log(`   École    : ${SCHOOL_SLUG}`);
  console.log(`   Rounds   : ${ROUNDS} par endpoint\n`);

  const summary: Record<string, { t1: number; t2: number; errors: number }> = {};

  for (const ep of ENDPOINTS) {
    summary[ep] = { t1: 0, t2: 0, errors: 0 };
    console.log(`\n━━━  ${ep}  ━━━`);

    for (let i = 0; i < ROUNDS; i++) {
      const r = await testEndpoint(ep);
      const icon = r.ok ? '✅' : '❌';
      const tunnel = r.tunnel === TUNNEL_1 ? 'T1' : 'T2';
      console.log(`  ${icon} [${tunnel}] ${r.status} — ${r.latencyMs} ms`);
      if (!r.ok) {
        console.log(`     ↳ ${r.body}`);
        summary[ep].errors++;
      }
      if (r.tunnel === TUNNEL_1) summary[ep].t1++;
      else summary[ep].t2++;

      // Small delay to avoid rate limiting
      await new Promise(res => setTimeout(res, 200));
    }
  }

  console.log('\n\n📊  Résumé du load-balancing\n');
  for (const [ep, s] of Object.entries(summary)) {
    console.log(`  ${ep}`);
    console.log(`    Tunnel 1 : ${s.t1} req  |  Tunnel 2 : ${s.t2} req  |  Erreurs : ${s.errors}`);
  }

  console.log('\n✅  Test terminé.\n');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
