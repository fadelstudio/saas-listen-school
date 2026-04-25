import { prisma } from '../../core/database/prisma';
import { systemService } from '../system/system.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvContext {
  lastSql?: string;
  lastQuestion?: string;
  lastDataSummary?: string;
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
CONTEXTE REQUÊTE PRÉCÉDENTE — POUR LES QUESTIONS DE SUIVI
══════════════════════════════════════════════════════════════
Question précédente : ${ctx.lastQuestion ?? '—'}
Résumé données retournées : ${ctx.lastDataSummary ?? '—'}
SQL précédent :
\`\`\`sql
${ctx.lastSql}
\`\`\`
► Si la question fait référence à "ce professeur", "cette campagne", "ce module", "lui", "elle",
  "même", "aussi", "son nom", "son titre", etc. → reprends les mêmes entités/filtres du SQL précédent.
  Modifie uniquement ce qui change (période, champ, groupement).
══════════════════════════════════════════════════════════════
` : '';

  return `
Tu es un expert SQL PostgreSQL pour une plateforme de pilotage pédagogique.

${contextBlock}

══════════════════════════════════════════════════════════════
DÉCISION PREMIÈRE
══════════════════════════════════════════════════════════════
• Question demande des DONNÉES (stats, listes, noms, scores, counts, tendances, bilans) → génère SQL
• Question est une SALUTATION ou QUESTION GÉNÉRALE PURE ("bonjour", "merci", "que peux-tu faire") → retourne : NO_QUERY
• En cas de doute → génère le SQL. Mieux vaut interroger la BD pour rien que de rater.

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
                      ⚠️ PAS de schoolId → filtrer via professors OU modules
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

【2】SCHOOLID — FILTRAGE OBLIGATOIRE :
    campuses, modules, professors, users, reports, evaluations, decisions, notifications, analysis_reports
      → WHERE table."schoolId" = '${schoolId}'
    classes (pas schoolId)
      → JOIN campuses ca ON cl."campusId"=ca.id WHERE ca."schoolId"='${schoolId}'
    evaluation_campaigns (pas schoolId)
      → JOIN professors p ON ec."professorId"=p.id WHERE p."schoolId"='${schoolId}'
      → OU JOIN modules m ON ec."moduleId"=m.id WHERE m."schoolId"='${schoolId}'

【3】CAMELCASE entre guillemets doubles :
    "schoolId","firstName","lastName","createdAt","isActive","isAnonymous","dueDate","campaignId","classId"

【4】ENUMS → CAST(col AS TEXT) = 'VALEUR'

【5】NOMS LISIBLES — TOUJOURS :
    Professeur → CONCAT(p."firstName",' ',p."lastName") AS professor_name
    Campagne   → ec.title AS campaign_title   ← JAMAIS OMETTRE
    Classe     → cl.name AS class_name
    Module     → m.name AS module_name
    Campus     → ca.name AS campus_name
    Auteur     → CONCAT(u."firstName",' ',u."lastName") AS author_name
    Décideur   → CONCAT(u."firstName",' ',u."lastName") AS decider_name

【6】AGRÉGATS :
    ROUND(AVG(e.score)::numeric,2) AS avg_score
    COUNT(*) AS total
    COUNT(*) FILTER (WHERE cond) AS filtered_count
    ROUND(100.0*COUNT(*) FILTER (WHERE cond)/NULLIF(COUNT(*),0),1) AS rate_pct

【7】DATES :
    "aujourd'hui"      → "createdAt"::date = CURRENT_DATE
    "dernières 24h"    → "createdAt" >= NOW()-INTERVAL '1 day'
    "cette semaine"    → "createdAt" >= DATE_TRUNC('week',NOW())
    "ce mois"          → "createdAt" >= DATE_TRUNC('month',NOW())
    "mois dernier"     → "createdAt" >= DATE_TRUNC('month',NOW()-INTERVAL '1 month') AND "createdAt" < DATE_TRUNC('month',NOW())
    "ce semestre"      → "createdAt" >= NOW()-INTERVAL '6 months'
    "cette année"      → "createdAt" >= DATE_TRUNC('year',NOW())
    "plus ancien"      → ORDER BY "createdAt" ASC
    "plus récent"      → ORDER BY "createdAt" DESC
    Échéance proche    → "dueDate" BETWEEN NOW() AND NOW()+INTERVAL '7 days'

【8】LIMITES :
    top N / meilleur/pire → LIMIT 5
    liste générale        → LIMIT 20
    comptage pur          → pas de LIMIT
    entité unique         → LIMIT 1

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
EXEMPLES COMPLETS PAR CATÉGORIE
══════════════════════════════════════════════════════════════

--- CAMPAGNES ---

-- Plus ancienne / récente
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

-- Campagnes actives avec taux de complétion
SELECT ec.title AS campaign_title, ec.scope, ec."dueDate",
  CONCAT(p."firstName",' ',p."lastName") AS professor_name,
  m.name AS module_name, ca.name AS campus_name,
  COUNT(e.id) AS total_evals,
  COUNT(e.id) FILTER (WHERE CAST(e.status AS TEXT)='COMPLETED') AS completed,
  ROUND(100.0*COUNT(e.id) FILTER (WHERE CAST(e.status AS TEXT)='COMPLETED')/NULLIF(COUNT(e.id),0),1) AS completion_pct
FROM evaluation_campaigns ec
JOIN professors p ON ec."professorId"=p.id
LEFT JOIN modules m ON ec."moduleId"=m.id
LEFT JOIN campuses ca ON ec."campusId"=ca.id
LEFT JOIN evaluations e ON e."campaignId"=ec.id
WHERE p."schoolId"='${schoolId}' AND ec.status='ACTIVE'
GROUP BY ec.id,ec.title,ec.scope,ec."dueDate",p."firstName",p."lastName",m.name,ca.name
ORDER BY ec."dueDate" ASC LIMIT 20;

-- Échéances cette semaine
SELECT ec.title AS campaign_title, ec.status, ec."dueDate",
  CONCAT(p."firstName",' ',p."lastName") AS professor_name
FROM evaluation_campaigns ec
JOIN professors p ON ec."professorId"=p.id
WHERE p."schoolId"='${schoolId}'
  AND ec."dueDate" BETWEEN NOW() AND NOW()+INTERVAL '7 days'
ORDER BY ec."dueDate" ASC;

--- PROFESSEURS ---

-- Meilleur/pire score
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

-- Plus de signalements
SELECT CONCAT(p."firstName",' ',p."lastName") AS professor_name,
  COUNT(r.id) AS report_count,
  COUNT(r.id) FILTER (WHERE CAST(r.priority AS TEXT) IN ('HIGH','CRITICAL')) AS critical_count
FROM reports r JOIN professors p ON r."professorId"=p.id
WHERE r."schoolId"='${schoolId}'
GROUP BY p.id,p."firstName",p."lastName"
ORDER BY report_count DESC LIMIT 5;

-- Sans aucune évaluation
SELECT CONCAT(p."firstName",' ',p."lastName") AS professor_name, p.email
FROM professors p
WHERE p."schoolId"='${schoolId}'
  AND NOT EXISTS (SELECT 1 FROM evaluations e WHERE e."professorId"=p.id AND e."schoolId"='${schoolId}');

-- Évolution mensuelle
SELECT CONCAT(p."firstName",' ',p."lastName") AS professor_name,
  TO_CHAR(DATE_TRUNC('month',e."createdAt"),'YYYY-MM') AS month,
  ROUND(AVG(e.score)::numeric,2) AS avg_score, COUNT(e.id) AS count
FROM evaluations e JOIN professors p ON e."professorId"=p.id
WHERE e."schoolId"='${schoolId}' AND e.score IS NOT NULL
GROUP BY p.id,p."firstName",p."lastName",DATE_TRUNC('month',e."createdAt")
ORDER BY p."lastName",month DESC LIMIT 30;

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

-- Tendance mensuelle
SELECT TO_CHAR(DATE_TRUNC('month',r."createdAt"),'YYYY-MM') AS month,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE CAST(r.priority AS TEXT) IN ('HIGH','CRITICAL')) AS critical_count,
  COUNT(*) FILTER (WHERE r."isAnonymous"=TRUE) AS anonymous_count
FROM reports r WHERE r."schoolId"='${schoolId}'
GROUP BY DATE_TRUNC('month',r."createdAt")
ORDER BY month DESC LIMIT 12;

-- Temps moyen de traitement
SELECT ROUND(AVG(EXTRACT(EPOCH FROM (r."updatedAt"-r."createdAt"))/3600)::numeric,1) AS avg_hours
FROM reports r WHERE r."schoolId"='${schoolId}'
  AND CAST(r.status AS TEXT) IN ('APPROVED','REJECTED');

--- ÉVALUATIONS ---

-- Bilan global
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

-- Comparaison semestre actuel vs précédent
SELECT
  CASE WHEN e."createdAt">=NOW()-INTERVAL '6 months' THEN 'Semestre actuel' ELSE 'Semestre précédent' END AS period,
  ROUND(AVG(e.score)::numeric,2) AS avg_score, COUNT(e.id) AS count
FROM evaluations e
WHERE e."schoolId"='${schoolId}' AND e.score IS NOT NULL
  AND e."createdAt">=NOW()-INTERVAL '12 months'
GROUP BY 1 ORDER BY 1;

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

-- Dashboard complet une requête
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

-- Comparaison ce mois vs mois précédent
SELECT period,reports,critical FROM (
  SELECT 'Ce mois' AS period, COUNT(r.id) AS reports,
    COUNT(r.id) FILTER (WHERE CAST(r.priority AS TEXT) IN ('HIGH','CRITICAL')) AS critical
  FROM reports r WHERE r."schoolId"='${schoolId}' AND r."createdAt">=DATE_TRUNC('month',NOW())
  UNION ALL
  SELECT 'Mois précédent', COUNT(r.id),
    COUNT(r.id) FILTER (WHERE CAST(r.priority AS TEXT) IN ('HIGH','CRITICAL'))
  FROM reports r WHERE r."schoolId"='${schoolId}'
    AND r."createdAt">=DATE_TRUNC('month',NOW()-INTERVAL '1 month')
    AND r."createdAt"<DATE_TRUNC('month',NOW())
) t;

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
  isGeneral: boolean
): string {
  if (isGeneral) {
    return `${systemIdentity}

${historyBlock ? `HISTORIQUE :\n${historyBlock}\n` : ''}
QUESTION : ${question}

Réponds en français, de manière chaleureuse et professionnelle.
- Salutation / remerciement → 1-2 phrases max. Ne te présente pas si déjà fait dans l'historique.
- "Que peux-tu faire ?" → liste tes capacités : statistiques, campagnes d'évaluation, signalements,
  classements professeurs, scores par classe/campus/module, tendances, bilans, décisions, notifications.
- Tu t'appelles MyIA et tu représentes "${schoolName}".`;
  }

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
3. TON ASSERTIF : Jamais "D'après les données", "il me semble", "je pense". Affirme avec certitude.
4. EX-AEQUO : Si plusieurs éléments ont la même valeur → cite-les TOUS avec "à égalité".
5. VIDE : Si JSON vide ou "Aucun résultat" → "Aucune donnée disponible pour cette demande."
6. ERREUR TECHNIQUE : "Je ne peux pas récupérer cette information pour le moment."
7. FORMAT :
   - Question simple     → 2-4 phrases directes avec les chiffres clés
   - Liste d'éléments   → puces propres avec valeurs clés
   - Bilan complet      → métriques structurées, lisibles
   - Tendance/évolution → direction (hausse/baisse) + chiffres avant/après
8. SUITE DE CONVERSATION : Si question courte de suivi → réfère-toi à l'historique.
9. IDENTITÉ : Ne te présente pas si l'historique montre que tu l'as déjà fait.
10. Jamais de SQL, de noms de tables ni d'UUIDs dans la réponse.
11. Établissement : "${schoolName}".`;
}

// ─── SQL Executor with Retry ──────────────────────────────────────────────────

async function executeSqlWithRetry(
  sql: string,
  question: string,
  schoolId: string,
  aiBalancer: any,
  sqlSystemPrompt: string
): Promise<{ data: string; executedSql: string }> {
  const upper = sql.toUpperCase();
  const safe = upper.startsWith('SELECT') && !upper.includes('DROP ') &&
    !upper.includes('DELETE ') && !upper.includes('UPDATE ') &&
    !upper.includes('INSERT ') && !upper.includes('TRUNCATE ') && !upper.includes('ALTER ');

  if (!safe) return { data: 'Requête bloquée (SELECT uniquement).', executedSql: '' };

  const serialize = (result: any) => {
    const s = JSON.stringify(result, (_k, v) => typeof v === 'bigint' ? v.toString() : v);
    const t = s.length > 8000 ? s.substring(0, 8000) + '… (tronqué)' : s;
    return t === '[]' ? 'Aucun résultat trouvé.' : t;
  };

  try {
    console.log('⚡ SQL attempt 1:', sql);
    return { data: serialize(await prisma.$queryRawUnsafe(sql)), executedSql: sql };
  } catch (e1: any) {
    console.error('❌ SQL Error (1):', e1.message);
    try {
      const retryRes = await aiBalancer.callAI(`${sqlSystemPrompt}

La requête a échoué : "${e1.message}"
SQL en erreur :
\`\`\`sql
${sql}
\`\`\`
Corrections requises :
- evaluation_campaigns → JOIN professors p ON ec."professorId"=p.id WHERE p."schoolId"='${schoolId}'
- classes → JOIN campuses ca ON cl."campusId"=ca.id WHERE ca."schoolId"='${schoolId}'
- Guillemets doubles sur toutes les colonnes camelCase
- CAST(col AS TEXT) sur tous les enums
- ec.title AS campaign_title obligatoire pour les campagnes
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
          console.log('⚡ SQL attempt 2 (corrected):', retrySql);
          return { data: serialize(await prisma.$queryRawUnsafe(retrySql)), executedSql: retrySql };
        }
      }
    } catch (e2: any) {
      console.error('❌ SQL Error (2):', e2.message);
    }
    return { data: 'Impossible de récupérer cette information (erreur technique interne).', executedSql: '' };
  }
}

// ─── Chat Service ─────────────────────────────────────────────────────────────

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

    // SQL context (persisted in DB)
    const ctx = await this.loadSqlContext(convId as string);

    // Save user message
    await this.addMessage(convId as string, 'user', question);

    const { aiBalancer } = await import('../../core/ai/AiBalancer');
    const systemIdentity = `Tu es MyIA, l'Assistant IA officiel de "${schoolName}". Tu es un expert en pilotage pédagogique, analyse des signalements et suivi des évaluations.`;
    const historyBlock = formatHistory(history);

    let answer = '';
    let isGeneral = false;

    try {
      // ── Étape 1 : SQL (toujours) — l'IA décide elle-même NO_QUERY ────────────
      const sqlSystemPrompt = buildSqlPrompt(schoolId, ctx);
      const sqlUserPrompt = [
        historyBlock ? `HISTORIQUE :\n${historyBlock}\n` : '',
        `QUESTION : ${question}`,
        '',
        '→ Si salutation/question générale pure : NO_QUERY',
        '→ Sinon : SQL complet avec tous les noms lisibles et ec.title AS campaign_title pour les campagnes.',
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

          if (executedSql) {
            await this.saveSqlContext(convId as string, {
              lastSql: executedSql,
              lastQuestion: question,
              lastDataSummary: dbDataStr.substring(0, 400),
            });
          }
        } else {
          isGeneral = true; // No SQL pattern found → general
        }
      }

      // ── Étape 2 : Réponse naturelle ───────────────────────────────────────────
      const finalPrompt = buildResponsePrompt(systemIdentity, dbDataStr, historyBlock, question, schoolName, isGeneral);
      const finalRes = await aiBalancer.callAI(finalPrompt, schoolId);
      answer = finalRes.content.trim();

    } catch (e: any) {
      console.error('❌ AI Balancer completely failed:', e.message);
      answer = "Je suis actuellement très sollicité et mes systèmes ont besoin de refroidir un instant. Veuillez réessayer dans une petite minute !";
    }

    await this.addMessage(convId as string, 'assistant', answer);

    return { answer, conversationId: convId as string, usedDB: !isGeneral, schoolName };
  },
};