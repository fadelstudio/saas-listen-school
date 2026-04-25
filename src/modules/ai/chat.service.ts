import { prisma } from '../../core/database/prisma';
import { systemService } from '../system/system.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvContext {
  lastSql?: string;
  lastQuestion?: string;
  lastDataSummary?: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'table';
  title: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

// ─── Chart Detection ──────────────────────────────────────────────────────────

/**
 * Analyse les données brutes retournées par le SQL et produit un ChartData si applicable.
 * Règles :
 *  - Colonne "month" ou "day" ou "date" + colonne numérique → line chart
 *  - Colonne *_name / *_title + 1-3 colonnes numériques → bar chart
 *  - Colonne "status" / "type" / "band" / "role" / "period" + colonne count → bar ou pie
 */
function detectChartData(rows: any[], question: string): ChartData | null {
  if (!Array.isArray(rows) || rows.length < 2) return null;

  const keys = Object.keys(rows[0]);
  if (keys.length < 2) return null;

  const numericKeys = keys.filter(k => {
    const low = k.toLowerCase();
    // Exclure les IDs, les timestamps (at/At) et les dates
    if (low.endsWith('id') || low.endsWith('at') || low.includes('date')) return false;
    const v = rows[0][k];
    return v !== null && typeof v !== 'boolean' && !isNaN(Number(v));
  });

  const labelKeys = keys.filter(k => !numericKeys.includes(k));
  if (labelKeys.length === 0 || numericKeys.length === 0) return null;

  const labelKey = labelKeys[0];
  const labels = rows.map(r => String(r[labelKey] ?? ''));

  // ── Time-series → line chart ──
  const isTimeSeries =
    labelKey.includes('month') || labelKey.includes('day') ||
    labelKey.includes('date') || labelKey.includes('period') ||
    /^\d{4}-\d{2}/.test(labels[0]);

  if (isTimeSeries) {
    const datasets = numericKeys.slice(0, 3).map(k => ({
      label: k.replace(/_/g, ' '),
      data: rows.map(r => Number(r[k]) || 0),
    }));
    return {
      type: 'line',
      title: buildChartTitle(question),
      labels,
      datasets,
    };
  }

  // ── Status / type / band distribution → pie si <= 6 lignes, sinon bar ──
  const isCategorical =
    labelKey.includes('status') || labelKey.includes('type') ||
    labelKey.includes('band') || labelKey.includes('role') ||
    labelKey.includes('pct') || labelKey.includes('scope');

  if (isCategorical) {
    return {
      type: rows.length <= 6 ? 'pie' : 'bar',
      title: buildChartTitle(question),
      labels,
      datasets: [{
        label: numericKeys[0].replace(/_/g, ' '),
        data: rows.map(r => Number(r[numericKeys[0]]) || 0),
      }],
    };
  }

  // ── Ranking / comparaison → bar chart ──
  const isRanking =
    labelKey.includes('name') || labelKey.includes('title') ||
    labelKey.includes('campus') || labelKey.includes('class') ||
    labelKey.includes('module') || labelKey.includes('professor');

  if (isRanking && rows.length >= 2) {
    const datasets = numericKeys.slice(0, 3).map(k => ({
      label: k.replace(/_/g, ' '),
      data: rows.map(r => Number(r[k]) || 0),
    }));
    return {
      type: 'bar',
      title: buildChartTitle(question),
      labels,
      datasets,
    };
  }

  return null;
}

function buildChartTitle(question: string): string {
  // Capitalize first word, truncate
  const clean = question.replace(/^salut[, ]+/i, '').replace(/^(tu peux|peux-tu)[, ]*/i, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1, 60) + (clean.length > 60 ? '…' : '');
}

// ─── History Formatter ────────────────────────────────────────────────────────

function formatHistory(history: Array<{ role: string; content: string }>): string {
  if (!history || history.length === 0) return '';
  return history
    .slice(-12)
    .map(m => `${m.role === 'user' ? '👤 Admin' : '🤖 MyIA'}: ${m.content}`)
    .join('\n');
}

// ─── SQL Prompt ───────────────────────────────────────────────────────────────

function buildSqlPrompt(schoolId: string, ctx: ConvContext): string {
  const contextBlock = ctx.lastSql
    ? `
══════════════════════════════════════════════════════════════
CONTEXTE REQUÊTE PRÉCÉDENTE
══════════════════════════════════════════════════════════════
Question précédente : ${ctx.lastQuestion ?? '—'}
Résumé données : ${ctx.lastDataSummary ?? '—'}
SQL précédent :
\`\`\`sql
${ctx.lastSql}
\`\`\`
► Question de suivi ("ce prof", "cette classe", "son nom", "lui", "même", "aussi") → reprends les mêmes
  entités/filtres du SQL précédent. Modifie seulement ce qui change.
══════════════════════════════════════════════════════════════
` : '';

  return `
Tu es un expert SQL PostgreSQL pour une plateforme de pilotage pédagogique.

${contextBlock}

══════════════════════════════════════════════════════════════
DÉCISION PREMIÈRE
══════════════════════════════════════════════════════════════
• Question sur le PROJET ou les DONNÉES : (évaluations, campagnes, professeurs, signalements, reports, classes, modules, campus, utilisateurs, décisions, stats, classements, scores, tendances) → génère le SQL.
• Salutation / Hors-sujet / Blague / Demande globale ("bonjour", "raconte une blague", "merci", "comment ça va", "que peux-tu faire") → retourne EXACTEMENT la chaîne : NO_QUERY
• En cas de doute absolu → génère le SQL.

══════════════════════════════════════════════════════════════
SCHÉMA
══════════════════════════════════════════════════════════════

schools:              id, name, domain, logoUrl, slug, createdAt, updatedAt
campuses:             id, name, location, code, phone, schoolId, createdAt, updatedAt
classes:              id, name, campusId, levelId, createdAt, updatedAt            ⚠️ PAS de schoolId
academic_levels:      id, name, "order", schoolId, createdAt, updatedAt
modules:              id, name, code, schoolId, createdAt, updatedAt
professors:           id, "firstName","lastName", email, matricule, numero, phone, avatarPath, userId, schoolId, createdAt, updatedAt
users:                id, "firstName","lastName", email, role, matricule, numero, phone, "isActive","emailVerified","classId", schoolId, createdAt, updatedAt
                      role: 'STUDENT'|'PROFESSOR'|'ADMIN'|'SUPER_ADMIN'|'MANAGER'|'VIEWER'|'AGENT'
reports:              id, title, content, type, priority, status, "isAnonymous", category,
                      "authorId","classId","professorId","moduleId", attachments,"aiAnalysis", schoolId, createdAt, updatedAt
                      priority: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'
                      status:   'DRAFT'|'SUBMITTED'|'REVIEWED'|'APPROVED'|'REJECTED'
                      type:     'PROBLEM_MATERIAL'|'PROBLEM_ADMIN'|'PROBLEM_PEDAGOGICAL'|'INCIDENT'|'SUGGESTION'|'OTHER'
evaluations:          id, "professorId","moduleId","classId","campaignId","evaluatorId","reportId",
                      status, "isAnonymous", score, comment, "aiScore",
                      "availabilityRating","comprehensionRating","explanationRating","pedagogyRating","rhythmRating",
                      schoolId, createdAt, updatedAt
                      status:     'PENDING'|'IN_PROGRESS'|'COMPLETED'
                      RatingBand: 'VERY_POOR'|'POOR'|'FAIR'|'GOOD'|'EXCELLENT'
evaluation_campaigns: id, title, description, status, scope, "dueDate","campusId","classId","moduleId","professorId", createdAt, updatedAt
                      ⚠️ PAS de schoolId → JOIN professors OU modules
                      status: 'DRAFT'|'ACTIVE'|'CLOSED'|'ARCHIVED'
                      scope:  'CAMPUS'|'CLASS'|'MODULE'|'PROFESSOR'
decisions:            id, title, rationale, status, priority, responsible, "dueDate","aiSuggestion",
                      "reportId","evaluationId","campaignId","analysisId","deciderId", schoolId, createdAt, updatedAt
                      status:   'PENDING'|'PROPOSED'|'APPROVED'|'REJECTED'|'IN_PROGRESS'|'DONE'
                      priority: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'
notifications:        id, title, message, type, "userId","campaignId", schoolId, "isRead", createdAt
class_modules:        id, "classId","moduleId", createdAt, updatedAt
analysis_reports:     id, schoolId, title, content, filters, "generatedById","isRead", createdAt, updatedAt

══════════════════════════════════════════════════════════════
RÈGLES ABSOLUES
══════════════════════════════════════════════════════════════

【1】FORMAT : \`\`\`sql ... \`\`\` OU exactement NO_QUERY

【2】SCHOOLID :
    campuses, modules, professors, users, reports, evaluations, decisions, notifications, analysis_reports
      → WHERE table."schoolId" = '${schoolId}'
    classes → JOIN campuses ca ON cl."campusId"=ca.id WHERE ca."schoolId"='${schoolId}'
    evaluation_campaigns → JOIN professors p ON ec."professorId"=p.id WHERE p."schoolId"='${schoolId}'

【3】CAMELCASE entre guillemets doubles toujours.

【4】ENUMS → CAST(col AS TEXT) = 'VALEUR'

【5】NOMS LISIBLES TOUJOURS :
    Professeur → CONCAT(p."firstName",' ',p."lastName") AS professor_name
    Campagne   → ec.title AS campaign_title
    Classe     → cl.name AS class_name
    Module     → m.name AS module_name
    Campus     → ca.name AS campus_name
    Auteur     → CONCAT(u."firstName",' ',u."lastName") AS author_name

【6】AGRÉGATS :
    ROUND(AVG(e.score)::numeric,2) AS avg_score
    COUNT(DISTINCT x.id) AS total   ← DISTINCT pour éviter doublons en multi-JOIN
    ROUND(100.0*COUNT(*) FILTER (WHERE cond)/NULLIF(COUNT(*),0),1) AS rate_pct

【7】DATES :
    "aujourd'hui"         → "createdAt"::date = CURRENT_DATE
    "dernières 24h"       → "createdAt" >= NOW()-INTERVAL '1 day'
    "ces X derniers jours"→ "createdAt" >= NOW()-INTERVAL 'X days'  ← ex: 10 jours = INTERVAL '10 days'
    "cette semaine"       → "createdAt" >= DATE_TRUNC('week',NOW())
    "ce mois"             → "createdAt" >= DATE_TRUNC('month',NOW())
    "mois dernier"        → "createdAt" >= DATE_TRUNC('month',NOW()-INTERVAL '1 month') AND "createdAt" < DATE_TRUNC('month',NOW())
    "ce semestre"         → "createdAt" >= NOW()-INTERVAL '6 months'
    "cette année"         → "createdAt" >= DATE_TRUNC('year',NOW())
    Courbe/tendance par jour → GROUP BY "createdAt"::date, ORDER BY date ASC (pas DESC)
    Courbe/tendance par mois → GROUP BY DATE_TRUNC('month',"createdAt"), ORDER BY month ASC

【8】LIMITES — RÈGLE CRITIQUE :
    ════════════════════════════════════════════════════════════
    ❌ JAMAIS LIMIT 1 — même pour "la plus", "la moins", "quelle est la meilleure"
    ════════════════════════════════════════════════════════════
    "combat" / "classement" / "comparaison" / "toutes les classes/profs/modules"
      → TOUTES les lignes disponibles, LIMIT 20 maximum
    "top N" / "les X meilleurs/pires"
      → LIMIT N (ex: top 5 = LIMIT 5, top 3 = LIMIT 3)
    "le meilleur" / "le pire" seul sans comparaison demandée
      → LIMIT 5 (pour les ex-aequo)
    liste générale
      → LIMIT 20
    comptage pur (COUNT seulement)
      → pas de LIMIT
    courbe / tendance (GROUP BY date)
      → pas de LIMIT ou LIMIT 90 (jours) / LIMIT 24 (mois)

    ► Pour "combat" ou "quelle classe a le plus de X" :
      Retourne TOUTES les classes avec leurs scores pour permettre la comparaison complète.
      Le gagnant ressort naturellement en premier avec ORDER BY DESC.

【9】ALIAS : r=reports, e=evaluations, ec=evaluation_campaigns, p=professors,
             cl=classes, m=modules, ca=campuses, d=decisions, u=users, al=academic_levels

【10】ORDER BY AVEC EXPRESSIONS (PostgreSQL) :
    NE JAMAIS utiliser d'alias défini dans le SELECT à l'intérieur d'une opération mathématique dans ORDER BY.
    ❌ ORDER BY eval_count + report_count DESC
    ✓ ORDER BY COUNT(DISTINCT e.id) + COUNT(DISTINCT r.id) DESC

【11】COLONNES PIÈGES :
    - table REPORTS : N'A PAS de colonne "userId" (utilise "authorId" à la place).
    - table REPORTS : N'A PAS de colonne "campaignId" (liez via "classId" ou "professorId").

══════════════════════════════════════════════════════════════
EXEMPLES PAR CATÉGORIE
══════════════════════════════════════════════════════════════

--- COMBAT / CLASSEMENT TOUTES CLASSES ---

-- "Combat" signalements + évaluations par classe → TOUTES les classes, pas LIMIT 1
SELECT
  cl.name AS class_name,
  COUNT(DISTINCT r.id) AS total_reports,
  COUNT(DISTINCT e.id) AS total_evaluations,
  (COUNT(DISTINCT r.id) + COUNT(DISTINCT e.id)) AS total_activity
FROM classes cl
JOIN campuses ca ON cl."campusId"=ca.id
LEFT JOIN reports r ON cl.id=r."classId" AND r."schoolId"='${schoolId}'
LEFT JOIN evaluations e ON cl.id=e."classId" AND e."schoolId"='${schoolId}'
WHERE ca."schoolId"='${schoolId}'
GROUP BY cl.id,cl.name
ORDER BY total_activity DESC
LIMIT 20;

--- COURBES / TENDANCES (time-series) ---

-- Courbe signalements par jour sur N jours
SELECT
  r."createdAt"::date AS day,
  COUNT(*) AS total_reports,
  COUNT(*) FILTER (WHERE CAST(r.priority AS TEXT) IN ('HIGH','CRITICAL')) AS critical_reports
FROM reports r
WHERE r."schoolId"='${schoolId}'
  AND r."createdAt" >= NOW()-INTERVAL '10 days'
GROUP BY r."createdAt"::date
ORDER BY day ASC;

-- Courbe évaluations par mois sur 12 mois
SELECT
  TO_CHAR(DATE_TRUNC('month',e."createdAt"),'YYYY-MM') AS month,
  ROUND(AVG(e.score)::numeric,2) AS avg_score,
  COUNT(e.id) AS total_evals
FROM evaluations e
WHERE e."schoolId"='${schoolId}' AND e.score IS NOT NULL
  AND e."createdAt" >= NOW()-INTERVAL '12 months'
GROUP BY DATE_TRUNC('month',e."createdAt")
ORDER BY month ASC;

--- CAMPAGNES ---

SELECT ec.id, ec.title AS campaign_title, ec.status, ec.scope, ec."dueDate", ec."createdAt",
  CONCAT(p."firstName",' ',p."lastName") AS professor_name,
  m.name AS module_name, cl.name AS class_name, ca.name AS campus_name
FROM evaluation_campaigns ec
JOIN professors p ON ec."professorId"=p.id
LEFT JOIN modules m ON ec."moduleId"=m.id
LEFT JOIN classes cl ON ec."classId"=cl.id
LEFT JOIN campuses ca ON ec."campusId"=ca.id
WHERE p."schoolId"='${schoolId}'
ORDER BY ec."createdAt" ASC LIMIT 5;

--- PROFESSEURS ---

-- Meilleurs/pires scores
SELECT CONCAT(p."firstName",' ',p."lastName") AS professor_name,
  ROUND(AVG(e.score)::numeric,2) AS avg_score, COUNT(e.id) AS eval_count
FROM evaluations e JOIN professors p ON e."professorId"=p.id
WHERE e."schoolId"='${schoolId}' AND e.score IS NOT NULL
GROUP BY p.id,p."firstName",p."lastName"
ORDER BY avg_score DESC LIMIT 5;

-- Scores détaillés par critère
SELECT CONCAT(p."firstName",' ',p."lastName") AS professor_name,
  ROUND(AVG(e.score)::numeric,2) AS avg_score,
  MODE() WITHIN GROUP (ORDER BY CAST(e."pedagogyRating" AS TEXT)) AS pedagogy,
  MODE() WITHIN GROUP (ORDER BY CAST(e."availabilityRating" AS TEXT)) AS availability,
  MODE() WITHIN GROUP (ORDER BY CAST(e."comprehensionRating" AS TEXT)) AS comprehension,
  MODE() WITHIN GROUP (ORDER BY CAST(e."explanationRating" AS TEXT)) AS explanation,
  MODE() WITHIN GROUP (ORDER BY CAST(e."rhythmRating" AS TEXT)) AS rhythm
FROM evaluations e JOIN professors p ON e."professorId"=p.id
WHERE e."schoolId"='${schoolId}' AND e.score IS NOT NULL
GROUP BY p.id,p."firstName",p."lastName"
ORDER BY avg_score DESC LIMIT 20;

-- Sans aucune évaluation
SELECT CONCAT(p."firstName",' ',p."lastName") AS professor_name, p.email
FROM professors p
WHERE p."schoolId"='${schoolId}'
  AND NOT EXISTS (SELECT 1 FROM evaluations e WHERE e."professorId"=p.id AND e."schoolId"='${schoolId}');

--- SIGNALEMENTS ---

-- Urgents non traités
SELECT r.title, CAST(r.priority AS TEXT) AS priority, CAST(r.status AS TEXT) AS status,
  CAST(r.type AS TEXT) AS type, r."createdAt",
  cl.name AS class_name,
  CONCAT(p."firstName",' ',p."lastName") AS professor_name,
  m.name AS module_name
FROM reports r
LEFT JOIN classes cl ON r."classId"=cl.id
LEFT JOIN professors p ON r."professorId"=p.id
LEFT JOIN modules m ON r."moduleId"=m.id
WHERE r."schoolId"='${schoolId}'
  AND CAST(r.priority AS TEXT) IN ('HIGH','CRITICAL')
  AND CAST(r.status AS TEXT) NOT IN ('APPROVED','REJECTED')
ORDER BY r."createdAt" DESC LIMIT 20;

-- Répartition par statut avec %
SELECT CAST(r.status AS TEXT) AS status, COUNT(*) AS count,
  ROUND(100.0*COUNT(*)/NULLIF(SUM(COUNT(*)) OVER(),0),1) AS pct
FROM reports r WHERE r."schoolId"='${schoolId}'
GROUP BY r.status ORDER BY count DESC;

--- ÉVALUATIONS ---

-- Score moyen global
SELECT ROUND(AVG(e.score)::numeric,2) AS global_avg, COUNT(e.id) AS total,
  COUNT(e.id) FILTER (WHERE CAST(e.status AS TEXT)='PENDING') AS pending,
  COUNT(e.id) FILTER (WHERE CAST(e.status AS TEXT)='COMPLETED') AS completed
FROM evaluations e WHERE e."schoolId"='${schoolId}';

-- Par campus
SELECT ca.name AS campus_name, ROUND(AVG(e.score)::numeric,2) AS avg_score, COUNT(e.id) AS count
FROM evaluations e
JOIN classes cl ON e."classId"=cl.id JOIN campuses ca ON cl."campusId"=ca.id
WHERE e."schoolId"='${schoolId}' AND e.score IS NOT NULL
GROUP BY ca.id,ca.name ORDER BY avg_score DESC;

-- Distribution des scores par tranche
SELECT
  CASE WHEN e.score<8 THEN '0-7 Insuffisant'
       WHEN e.score<12 THEN '8-11 Passable'
       WHEN e.score<15 THEN '12-14 Bien'
       WHEN e.score<18 THEN '15-17 Très bien'
       ELSE '18-20 Excellent' END AS band,
  COUNT(*) AS count
FROM evaluations e WHERE e."schoolId"='${schoolId}' AND e.score IS NOT NULL
GROUP BY 1 ORDER BY MIN(e.score);

--- DÉCISIONS ---

-- En retard
SELECT d.title, CAST(d.priority AS TEXT) AS priority, d."dueDate",
  CONCAT(u."firstName",' ',u."lastName") AS decider_name,
  EXTRACT(DAY FROM NOW()-d."dueDate")::int AS days_overdue
FROM decisions d LEFT JOIN users u ON d."deciderId"=u.id
WHERE d."schoolId"='${schoolId}'
  AND d."dueDate"<NOW()
  AND CAST(d.status AS TEXT) NOT IN ('DONE','REJECTED')
ORDER BY d."dueDate" ASC LIMIT 20;

--- BILAN GLOBAL ---

SELECT
  (SELECT COUNT(*) FROM reports r WHERE r."schoolId"='${schoolId}') AS total_reports,
  (SELECT COUNT(*) FROM reports r WHERE r."schoolId"='${schoolId}' AND CAST(r.status AS TEXT) NOT IN ('APPROVED','REJECTED')) AS open_reports,
  (SELECT COUNT(*) FROM reports r WHERE r."schoolId"='${schoolId}' AND CAST(r.priority AS TEXT) IN ('HIGH','CRITICAL') AND CAST(r.status AS TEXT) NOT IN ('APPROVED','REJECTED')) AS critical_open,
  (SELECT ROUND(AVG(score)::numeric,2) FROM evaluations e WHERE e."schoolId"='${schoolId}' AND score IS NOT NULL) AS global_avg_score,
  (SELECT COUNT(*) FROM evaluations e WHERE e."schoolId"='${schoolId}') AS total_evals,
  (SELECT COUNT(*) FROM evaluation_campaigns ec JOIN professors p ON ec."professorId"=p.id WHERE p."schoolId"='${schoolId}' AND ec.status='ACTIVE') AS active_campaigns,
  (SELECT COUNT(*) FROM decisions d WHERE d."schoolId"='${schoolId}' AND CAST(d.status AS TEXT) IN ('PENDING','PROPOSED','IN_PROGRESS')) AS pending_decisions,
  (SELECT COUNT(*) FROM users WHERE "schoolId"='${schoolId}' AND CAST(role AS TEXT)='STUDENT' AND "isActive"=TRUE) AS active_students,
  (SELECT COUNT(*) FROM professors WHERE "schoolId"='${schoolId}') AS total_professors,
  (SELECT COUNT(*) FROM notifications WHERE "schoolId"='${schoolId}' AND "isRead"=FALSE) AS unread_notifications;

══════════════════════════════════════════════════════════════
`.trim();
}

// ─── Response Prompt ──────────────────────────────────────────────────────────

function buildResponsePrompt(
  systemIdentity: string,
  dbDataStr: string,
  historyBlock: string,
  question: string,
  schoolName: string,
  isGeneral: boolean,
  hasChart: boolean
): string {
  if (isGeneral) {
    return `${systemIdentity}

${historyBlock ? `HISTORIQUE :\n${historyBlock}\n` : ''}
QUESTION : ${question}

Réponds en français, de manière chaleureuse, courte et directe.
- Salutation ou merci → réponds par une seule phrase amicale.
- Question hors-sujet ou blague → réponds directement, sans introduire tes fonctions.
- Si et SEULEMENT SI l'utilisateur demande "Qui es-tu ?" ou "Que peux-tu faire ?" → liste brièvement tes capacités liées au projet (stats, signalements, évaluations, tendances).
- Tu t'appelles MyIA et tu représentes "${schoolName}".`;
  }

  const chartNote = hasChart
    ? '\n9. GRAPHIQUE : Un graphique a été généré automatiquement pour cette réponse. Mentionne-le brièvement ("Voici aussi le graphique correspondant" ou similaire) mais ne décris pas les données visuelles en détail — laisse le graphique parler.'
    : '';

  return `${systemIdentity}

DONNÉES RÉCUPÉRÉES (JSON) :
${dbDataStr}

${historyBlock ? `HISTORIQUE :\n${historyBlock}\n` : ''}
QUESTION : ${question}

══════════════════════════════════════
RÈGLES DE RÉPONSE
══════════════════════════════════════
1. DONNÉES UNIQUEMENT : Utilise exclusivement le JSON ci-dessus. Jamais d'invention.
2. NOMS LISIBLES : Affiche campaign_title, professor_name, class_name, module_name, campus_name.
   Jamais d'UUID ni d'identifiants techniques.
3. TON ASSERTIF : Jamais "D'après les données", "il me semble". Affirme avec certitude.
4. CLASSEMENT COMPLET : Si les données contiennent plusieurs lignes (classement, combat, comparaison),
   CITE-LES TOUTES dans l'ordre. Ne dis jamais "les données ne concernent qu'une seule X" si le JSON
   en contient plusieurs.
5. EX-AEQUO : Si même valeur → "à égalité".
6. VIDE : SI ET SEULEMENT SI le JSON est vide ou dit "Aucun résultat" → réponds "Aucune donnée disponible.".
   SINON, tu dois obligatoirement décrire les données présentes.
7. ERREUR : "erreur technique" → "Je ne peux pas récupérer cette information pour le moment."
8. FORMAT :
   - Classement/combat → liste à puces numérotée avec rang et valeurs clés
   - Tendance/courbe → décris la direction (hausse/baisse/stable) + valeurs extrêmes
   - Bilan complet → métriques structurées
   - Question simple → 2-4 phrases directes${chartNote}
10. Jamais de SQL, d'UUIDs, de noms de tables dans la réponse.
11. Établissement : "${schoolName}".`;
}

// ─── SQL Executor with Retry ──────────────────────────────────────────────────

async function executeSqlWithRetry(
  sql: string,
  question: string,
  schoolId: string,
  aiBalancer: any,
  sqlSystemPrompt: string
): Promise<{ data: string; executedSql: string; rawRows: any[] }> {
  const upper = sql.toUpperCase();
  const safe = upper.startsWith('SELECT') && !upper.includes('DROP ') &&
    !upper.includes('DELETE ') && !upper.includes('UPDATE ') &&
    !upper.includes('INSERT ') && !upper.includes('TRUNCATE ') && !upper.includes('ALTER ');

  if (!safe) return { data: 'Requête bloquée (SELECT uniquement).', executedSql: '', rawRows: [] };

  const serialize = (rows: any[]) => {
    const s = JSON.stringify(rows, (_k, v) => typeof v === 'bigint' ? v.toString() : v);
    const t = s.length > 8000 ? s.substring(0, 8000) + '… (tronqué)' : s;
    return t === '[]' ? 'Aucun résultat trouvé.' : t;
  };

  try {
    console.log('⚡ SQL attempt 1:', sql);
    const rows = await prisma.$queryRawUnsafe(sql) as any[];
    return { data: serialize(rows), executedSql: sql, rawRows: rows };
  } catch (e1: any) {
    console.error('❌ SQL Error (1):', e1.message);
    try {
      const retryRes = await aiBalancer.callAI(`${sqlSystemPrompt}

La requête a échoué : "${e1.message}"
SQL en erreur :
\`\`\`sql
${sql}
\`\`\`
Corrections OBLIGATOIRES :
- evaluation_campaigns → JOIN professors p ON ec."professorId"=p.id WHERE p."schoolId"='${schoolId}'
- classes → JOIN campuses ca ON cl."campusId"=ca.id WHERE ca."schoolId"='${schoolId}'
- Guillemets doubles sur toutes colonnes camelCase
- CAST(col AS TEXT) sur tous les enums
- JAMAIS LIMIT 1 pour les classements/comparaisons/combats
- ORDER BY expressions → pas d'alias du SELECT dans les calculs
- REPORTS n'a PAS de "userId" → utilise "authorId"
- REPORTS n'a PAS de "campaignId" → pas de jointure directe avec evaluation_campaigns
QUESTION : ${question}
Génère uniquement la requête corrigée.`, schoolId);

      const m = retryRes.content.match(/```sql\s*([\s\S]*?)```/i) ||
        retryRes.content.match(/(SELECT\s[\s\S]+)/i);
      if (m) {
        const retrySql = (m[1] || m[0]).replace(/```/g, '').trim();
        const ru = retrySql.toUpperCase();
        if (ru.startsWith('SELECT') && !ru.includes('DROP ') && !ru.includes('DELETE ') && !ru.includes('UPDATE ')) {
          console.log('⚡ SQL attempt 2:', retrySql);
          const rows = await prisma.$queryRawUnsafe(retrySql) as any[];
          return { data: serialize(rows), executedSql: retrySql, rawRows: rows };
        }
      }
    } catch (e2: any) {
      console.error('❌ SQL Error (2):', e2.message);
    }
    return { data: 'Impossible de récupérer cette information (erreur technique interne).', executedSql: '', rawRows: [] };
  }
}

// ─── Schema helpers ───────────────────────────────────────────────────────────

export const chatService = {

  async ensureSchema() {
    try {
      const convCheck = await prisma.$queryRaw<any[]>`
        SELECT table_name FROM information_schema.tables WHERE table_name = 'ai_conversations'
      `;
      if (convCheck.length === 0) {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE ai_conversations (
            id TEXT PRIMARY KEY,
            "schoolId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            title TEXT NOT NULL,
            "isSaved" BOOLEAN DEFAULT FALSE,
            "sqlContext" TEXT DEFAULT NULL,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } else {
        const cols = await prisma.$queryRaw<any[]>`
          SELECT column_name FROM information_schema.columns WHERE table_name = 'ai_conversations'
        `;
        const names = cols.map((c: any) => c.column_name);
        if (!names.includes('isSaved'))
          await prisma.$executeRawUnsafe(`ALTER TABLE ai_conversations ADD COLUMN "isSaved" BOOLEAN DEFAULT FALSE`);
        if (!names.includes('sqlContext'))
          await prisma.$executeRawUnsafe(`ALTER TABLE ai_conversations ADD COLUMN "sqlContext" TEXT DEFAULT NULL`);
      }
      const msgCheck = await prisma.$queryRaw<any[]>`
        SELECT table_name FROM information_schema.tables WHERE table_name = 'ai_messages'
      `;
      if (msgCheck.length === 0) {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE ai_messages (
            id TEXT PRIMARY KEY,
            "conversationId" TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
      }
    } catch (err) {
      console.warn('⚠️ Schema self-healing failed:', err);
    }
  },

  async getConversations(schoolId: string, userId: string) {
    await this.ensureSchema();
    return prisma.$queryRaw<any[]>`
      SELECT c.id, c.title, c."isSaved", c."createdAt", c."updatedAt",
        (SELECT COUNT(*)::int FROM ai_messages m WHERE m."conversationId"=c.id) AS message_count
      FROM ai_conversations c
      WHERE c."schoolId"=${schoolId} AND c."userId"=${userId}
      ORDER BY c."updatedAt" DESC LIMIT 30
    `;
  },

  async getMessages(conversationId: string) {
    await this.ensureSchema();
    return prisma.$queryRaw<any[]>`
      SELECT id, role, content, "createdAt" FROM ai_messages
      WHERE "conversationId"=${conversationId} ORDER BY "createdAt" ASC
    `;
  },

  async createConversation(schoolId: string, userId: string, firstMessage: string) {
    await this.ensureSchema();
    const id = require('crypto').randomUUID();
    const title = firstMessage.substring(0, 60) + (firstMessage.length > 60 ? '…' : '');
    await prisma.$executeRawUnsafe(`
      INSERT INTO ai_conversations (id,"schoolId","userId",title)
      VALUES ('${id}','${schoolId}','${userId}','${title.replace(/'/g, "''")}')
    `);
    return { id, title };
  },

  async saveConversation(conversationId: string) {
    await prisma.$executeRawUnsafe(`
      UPDATE ai_conversations SET "isSaved"=TRUE,"updatedAt"=CURRENT_TIMESTAMP WHERE id='${conversationId}'
    `);
    return { saved: true };
  },

  async deleteConversation(conversationId: string) {
    await prisma.$executeRawUnsafe(`DELETE FROM ai_conversations WHERE id='${conversationId}'`);
    return { deleted: true };
  },

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
    const id = require('crypto').randomUUID();
    await prisma.$executeRawUnsafe(`
      INSERT INTO ai_messages (id,"conversationId",role,content)
      VALUES ('${id}','${conversationId}','${role}','${content.replace(/'/g, "''")}')
    `);
    await prisma.$executeRawUnsafe(`
      UPDATE ai_conversations SET "updatedAt"=CURRENT_TIMESTAMP WHERE id='${conversationId}'
    `);
    return { id, role, content };
  },

  async loadSqlContext(convId: string): Promise<ConvContext> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT "sqlContext" FROM ai_conversations WHERE id=${convId}
      `;
      if (rows.length > 0 && rows[0].sqlContext) return JSON.parse(rows[0].sqlContext);
    } catch { /* ignore */ }
    return {};
  },

  async saveSqlContext(convId: string, ctx: ConvContext) {
    try {
      const json = JSON.stringify(ctx).replace(/'/g, "''");
      await prisma.$executeRawUnsafe(`
        UPDATE ai_conversations SET "sqlContext"='${json}' WHERE id='${convId}'
      `);
    } catch { /* ignore */ }
  },

  // ── MAIN ─────────────────────────────────────────────────────────────────

  async askDirect(question: string, schoolId: string, userId: string, conversationId?: string) {
    await this.ensureSchema();

    // School name
    let schoolName = "l'établissement";
    try {
      const s = await systemService.getPublicSettings(schoolId);
      schoolName = s.schoolName || schoolName;
    } catch { /* default */ }

    // Conversation
    let convId = conversationId;
    if (!convId) {
      const c = await this.createConversation(schoolId, userId, question);
      convId = c.id;
    }

    // History
    let history: Array<{ role: string; content: string }> = [];
    try {
      history = await prisma.$queryRaw<any[]>`
        SELECT role, content FROM ai_messages
        WHERE "conversationId"=${convId} ORDER BY "createdAt" ASC LIMIT 20
      `;
    } catch { /* none */ }

    // SQL context
    const ctx = await this.loadSqlContext(convId as string);

    // Save user message
    await this.addMessage(convId as string, 'user', question);

    const { aiBalancer } = await import('../../core/ai/AiBalancer');
    const systemIdentity = `Tu es MyIA, l'Assistant IA officiel de "${schoolName}". Tu es un expert en pilotage pédagogique, analyse des signalements et suivi des évaluations.`;
    const historyBlock = formatHistory(history);

    let answer = '';
    let isGeneral = false;
    let chartData: ChartData | null = null;

    try {
      // ── Étape 1 : SQL ──────────────────────────────────────────────────────
      const sqlSystemPrompt = buildSqlPrompt(schoolId, ctx);
      const sqlUserPrompt = [
        historyBlock ? `HISTORIQUE :\n${historyBlock}\n` : '',
        `QUESTION : ${question}`,
        '',
        '→ SALUTATION / HORS-SUJET / BLAGUE ("bonjour", "merci", "qui es-tu", "raconte une blague") : retourne EXACTEMENT "NO_QUERY"',
        '→ TOUTE QUESTION SUR LE PROJET (graphe, courbe, stats, signalements, profs, dates, évaluations, classes,etudiant,modules, utilisateurs,decisions) : génère SQL avec noms lisibles. JAMAIS LIMIT 1.',
        '→ Pour combat/classement/comparaison : retourne TOUTES les lignes (LIMIT 20).',
        '→ Pour courbe/tendance : GROUP BY date ORDER BY date ASC sans LIMIT ou LIMIT 90.',
        '→ Pour evaluation_campaigns : ec.title AS campaign_title OBLIGATOIRE.',
      ].filter(Boolean).join('\n');

      const sqlRes = await aiBalancer.callAI(`${sqlSystemPrompt}\n\n${sqlUserPrompt}`, schoolId);
      const sqlContent = sqlRes.content.trim();

      let dbDataStr = '';
      let executedSql = '';

      if (sqlContent.includes('NO_QUERY')) {
        isGeneral = true;
      } else {
        const sqlMatch = sqlContent.match(/```sql\s*([\s\S]*?)```/i) ||
          sqlContent.match(/(SELECT\s[\s\S]+)/i);

        if (sqlMatch) {
          const sql = (sqlMatch[1] || sqlMatch[0]).replace(/```/g, '').trim();
          const result = await executeSqlWithRetry(sql, question, schoolId, aiBalancer, sqlSystemPrompt);
          dbDataStr = result.data;
          executedSql = result.executedSql;

          // ── Chart detection ──────────────────────────────────────────────
          if (result.rawRows.length >= 2) {
            chartData = detectChartData(result.rawRows, question);
          }

          if (executedSql) {
            await this.saveSqlContext(convId as string, {
              lastSql: executedSql,
              lastQuestion: question,
              lastDataSummary: dbDataStr.substring(0, 400),
            });
          }
        } else {
          isGeneral = true;
        }
      }

      // ── Étape 2 : Réponse naturelle ───────────────────────────────────────
      const finalPrompt = buildResponsePrompt(
        systemIdentity, dbDataStr, historyBlock, question, schoolName, isGeneral, chartData !== null
      );
      const finalRes = await aiBalancer.callAI(finalPrompt, schoolId);
      answer = finalRes.content.trim();

    } catch (e: any) {
      console.error('❌ AI Balancer completely failed:', e.message);
      answer = "Je suis actuellement très sollicité et mes systèmes ont besoin de refroidir un instant. Veuillez réessayer dans une petite minute !";
    }

    await this.addMessage(convId as string, 'assistant', answer);

    return {
      answer,
      conversationId: convId as string,
      usedDB: !isGeneral,
      schoolName,
      // chartData est null si pas de graphique applicable
      chartData,
    };
  },
};