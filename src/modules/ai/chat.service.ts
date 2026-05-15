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

function detectChartData(rows: any[], question: string): ChartData | null {
  if (!Array.isArray(rows) || rows.length < 2) return null;

  const keys = Object.keys(rows[0]);
  if (keys.length < 2) return null;

  const numericKeys = keys.filter(k => {
    const low = k.toLowerCase();
    if (low.endsWith('id') || low.endsWith('at') || low.includes('date')) return false;
    const v = rows[0][k];
    return v !== null && typeof v !== 'boolean' && !isNaN(Number(v));
  });

  const labelKeys = keys.filter(k => !numericKeys.includes(k));
  if (labelKeys.length === 0 || numericKeys.length === 0) return null;

  const labelKey = labelKeys[0];
  const labels = rows.map(r => String(r[labelKey] ?? ''));

  const isTimeSeries =
    labelKey.includes('month') || labelKey.includes('day') ||
    labelKey.includes('date') || labelKey.includes('period') ||
    /^\d{4}-\d{2}/.test(labels[0]);

  if (isTimeSeries) {
    const datasets = numericKeys.slice(0, 3).map(k => ({
      label: k.replace(/_/g, ' '),
      data: rows.map(r => Number(r[k]) || 0),
    }));
    return { type: 'line', title: buildChartTitle(question), labels, datasets };
  }

  const isCategorical =
    labelKey.includes('status') || labelKey.includes('type') ||
    labelKey.includes('band') || labelKey.includes('role') ||
    labelKey.includes('pct') || labelKey.includes('scope');

  if (isCategorical) {
    return {
      type: rows.length <= 6 ? 'pie' : 'bar',
      title: buildChartTitle(question),
      labels,
      datasets: [{ label: numericKeys[0].replace(/_/g, ' '), data: rows.map(r => Number(r[numericKeys[0]]) || 0) }],
    };
  }

  const isRanking =
    labelKey.includes('name') || labelKey.includes('title') ||
    labelKey.includes('campus') || labelKey.includes('class') ||
    labelKey.includes('module') || labelKey.includes('professor');

  if (isRanking && rows.length >= 2) {
    const datasets = numericKeys.slice(0, 3).map(k => ({
      label: k.replace(/_/g, ' '),
      data: rows.map(r => Number(r[k]) || 0),
    }));
    return { type: 'bar', title: buildChartTitle(question), labels, datasets };
  }

  return null;
}

function buildChartTitle(question: string): string {
  const clean = question
    .replace(/^(salut[, ]+|bonjour[, ]+)/i, '')
    .replace(/^(tu peux|peux-tu|montre[- ]?moi|donne[- ]?moi|affiche)[, ]*/i, '')
    .replace(/^(les?|des?|du|un|une)\s+/i, '');
  const title = clean.charAt(0).toUpperCase() + clean.slice(1);
  return title.length > 60 ? title.substring(0, 57) + '…' : title;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCHOOL_KNOWLEDGE = `
══════════════════════════════════════════════════════════════
DONNÉES PUBLIQUES ÉTABLISSEMENT (AFI-L'UE DAKAR)
══════════════════════════════════════════════════════════════
- ADRESSE : Rue G, Zone B, Dakar. Tel: +221 33 824 71 10. BP 17016.
- FILIÈRES : Gestion (Management, BFA, GRH, Marketing, Audit, Logistique), Droit (Ingénierie Juridique/Fiscale), Technologie (Génie Logiciel, Réseaux, Web, QHSE).
- DIPLÔMES : Licence (BAC+3), Master (BAC+5). Programmes: International Leader (AFI + FEDE + TOEIC) ou Multiprogramme (AFI + Ministère).
- RÈGLEMENT : Tenue obligatoire (Uniforme), ponctualité stricte, interdiction des syndicats/politique, pas d'excentricité.
- ADMISSION : Étude de dossier + Entretien. Insertion pro: 87% sur 5 ans.
- MODES : Initial, Continu (Soir), Week-end, E-learning (elearning-afi.com).
- ACCRÉDITATIONS : ANAQ-Sup, CAMES. Membre: FEDE, AACSB, AUF, EFMD.
══════════════════════════════════════════════════════════════
`;

// ─── History Formatter ────────────────────────────────────────────────────────

// AMÉLIORATION #1 : Historique réduit à 6 échanges (3 tours) pour libérer le contexte
// et éviter que le modèle se perde dans les vieux messages.
function formatHistory(history: Array<{ role: string; content: string }>): string {
  if (!history || history.length === 0) return '';
  return history
    .slice(-6) // Réduit de 12 à 6 — focus sur les échanges récents uniquement
    .map(m => `${m.role === 'user' ? 'User' : 'MyIA'}: ${m.content.substring(0, 300)}`) // Tronque les longs messages
    .join('\n');
}

// ─── NOUVEAU : Classifier d'intention léger ───────────────────────────────────
// AMÉLIORATION #2 : Pré-classification locale (sans appel IA) pour les cas évidents.
// Évite de consommer un appel API pour "bonjour" ou "merci".
function classifyIntentLocally(question: string): 'GENERAL' | 'ACTION' | 'DATA' | 'UNKNOWN' {
  const q = question.toLowerCase().trim();

  const generalPatterns = [
    /^(bonjour|salut|bonsoir|coucou|hello|hi\b)/,
    /^(merci|thanks|thank you|ok|okay|d'accord|super|parfait|cool)/,
    /^(qui es[- ]?tu|que peux[- ]?tu|comment ça va|comment vas[- ]?tu)/,
    /^(au revoir|bye|à bientôt|bonne journée)/,
    /^(raconte|blague|joke|fun|rigol)/,
    /^(oui|non|yes|no)\s*$/,
  ];

  const actionPatterns = [
    /^(je veux|j'aimerais|je souhaite|envoie|crée|fait) (signaler|suggérer|rapport|suggestion|proble|signal|siganl)/i,
    /^(signale|suggère|crée|envoie|rapporte) (un |une |le )?(signalement|suggestion|rapport|proble)/i,
    /(problème|souci|incident|bug|proble|pb|dysfonctionnement) (de|avec|sur|dans|salle) (wifi|clim|ordinateur|matériel|salle|prof|cours|internet)/i,
    /je (voudrais|veux) (rapporter|signaler) (que|un)/i,
  ];

  for (const p of generalPatterns) if (p.test(q)) return 'GENERAL';
  for (const p of actionPatterns) if (p.test(q)) return 'ACTION';

  // Si la question contient des mots métier → DATA
  const dataKeywords = [
    'évaluation', 'evaluation', 'prof', 'professeur', 'classe', 'campus',
    'module', 'étudiant', 'student', 'score', 'note', 'moyenne', 'rapport',
    'signalement', 'décision', 'campagne', 'statistique', 'stat', 'combien',
    'liste', 'classement', 'top', 'meilleur', 'pire', 'dernier', 'premier',
    'tendance', 'courbe', 'graphe', 'évolution', 'bilan', 'résumé',
    'actif', 'en attente', 'urgent', 'critique', 'retard',
  ];
  if (dataKeywords.some(k => q.includes(k))) return 'DATA';

  return 'UNKNOWN';
}

// ─── SQL Prompt ───────────────────────────────────────────────────────────────

// AMÉLIORATION #3 : Prompt SQL restructuré avec ordre de priorité clair.
// Les exemples sont condensés. On met les règles critiques EN PREMIER.
function buildSqlPrompt(
  schoolId: string,
  ctx: ConvContext,
  userId: string,
  role: string,
  campusIds?: string[],
  classId?: string | null
): string {

  const contextBlock = ctx.lastSql ? `
── CONTEXTE PRÉCÉDENT ──
Question: ${ctx.lastQuestion ?? '—'}
Résumé: ${ctx.lastDataSummary ?? '—'}
SQL:
\`\`\`sql
${ctx.lastSql}
\`\`\`
► "ce prof/cette classe/lui/même/aussi" → reprends les filtres du SQL précédent, modifie seulement ce qui change.
` : '';

  const campusFilter = campusIds && campusIds.length > 0
    ? `CAMPUS AUTORISÉS : [${campusIds.join(', ')}] — TOUTES les requêtes DOIVENT filtrer sur ces campus.`
    : 'CAMPUS : Accès global (pas de restriction).';

  const studentFilter = classId ? `
── ISOLATION ÉTUDIANT (STRICTE) ──
- evaluations → WHERE "evaluatorId" = '${userId}' uniquement
- reports → WHERE "authorId" = '${userId}' uniquement
- users → WHERE id = '${userId}' uniquement
- classes → WHERE id = '${classId}' uniquement
- JAMAIS UPDATE/DELETE/INSERT
` : '';

  return `Tu es un générateur SQL PostgreSQL expert pour une plateforme pédagogique.
École ID: '${schoolId}' | Rôle: ${role} | User: '${userId}'
${campusFilter}
${studentFilter}
${contextBlock}

══ RÈGLES ABSOLUES ══
1. FORMAT : \`\`\`sql ... \`\`\` OU exactement NO_QUERY (rien d'autre)
2. SÉCURITÉ : SELECT uniquement. JAMAIS DROP/DELETE/UPDATE/INSERT/TRUNCATE/ALTER.
3. SCHOOLID sur toutes les tables principales :
   - campuses/modules/professors/users/reports/evaluations/decisions/notifications → WHERE table."schoolId"='${schoolId}'
   - classes → JOIN campuses ca ON cl."campusId"=ca.id WHERE ca."schoolId"='${schoolId}'
   - evaluation_campaigns → JOIN professors p ON ec."professorId"=p.id WHERE p."schoolId"='${schoolId}'
4. GUILLEMETS : Toutes colonnes camelCase entre guillemets doubles.
5. ENUMS : CAST(col AS TEXT) = 'VALEUR'
6. NOMS LISIBLES :
   - Professeur → CONCAT(p."firstName",' ',p."lastName") AS professor_name
   - Campagne → ec.title AS campaign_title
   - Classe/Module/Campus → cl.name, m.name, ca.name
7. AGRÉGATS : ROUND(AVG(score)::numeric,2), COUNT(DISTINCT x.id)
8. LIMITES :
   - top N → LIMIT N
   - liste générale → LIMIT ${classId ? 10 : 20}
   - comptage pur → pas de LIMIT
   - courbe/tendance → ORDER BY date ASC, LIMIT 90 max
   - classement/combat → TOUTES les lignes (LIMIT 20 max), PAS LIMIT 1
9. PIÈGES :
   - reports.authorId (PAS userId), reports n'a PAS campaignId.
   - evaluation_campaigns n'a PAS schoolId → passer par professors.
   - Évaluations "en attente" → status IN ('PENDING', 'IN_PROGRESS').
10. ORDER BY : Réutiliser l'expression complète, pas un alias calculé.

── SCHÉMA RÉSUMÉ ──
schools(id,name,domain,logoUrl,slug)
campuses(id,name,location,code,phone,schoolId)
classes(id,name,campusId,levelId)  ← PAS de schoolId direct
academic_levels(id,name,order,schoolId)
modules(id,name,code,schoolId)
professors(id,firstName,lastName,email,matricule,phone,userId,schoolId)
users(id,firstName,lastName,email,role,matricule,classId,schoolId,isActive)
  role: STUDENT|PROFESSOR|ADMIN|SUPERADMIN|MANAGER|VIEWER|AGENT
reports(id,title,content,type,priority,status,isAnonymous,authorId,classId,professorId,moduleId,schoolId)
  priority: LOW|MEDIUM|HIGH|CRITICAL | status: DRAFT|SUBMITTED|REVIEWED|APPROVED|REJECTED
  type: PROBLEM_MATERIAL|PROBLEM_ADMIN|PROBLEM_PEDAGOGICAL|INCIDENT|SUGGESTION|OTHER
evaluations(id,professorId,moduleId,classId,campaignId,evaluatorId,reportId,status,score,comment,
  availabilityRating,comprehensionRating,explanationRating,pedagogyRating,rhythmRating,schoolId)
  status: PENDING|IN_PROGRESS|COMPLETED | RatingBand: VERY_POOR|POOR|FAIR|GOOD|EXCELLENT
evaluation_campaigns(id,title,description,status,scope,dueDate,campusId,classId,moduleId,professorId)
  ← PAS de schoolId | status: DRAFT|ACTIVE|CLOSED|ARCHIVED | scope: CAMPUS|CLASS|MODULE|PROFESSOR
decisions(id,title,rationale,status,priority,responsible,dueDate,reportId,evaluationId,campaignId,deciderId,schoolId)
  status: PENDING|PROPOSED|APPROVED|REJECTED|IN_PROGRESS|DONE | priority: LOW|MEDIUM|HIGH|CRITICAL
notifications(id,title,message,type,userId,campaignId,schoolId,isRead)
class_modules(id,classId,moduleId)
analysis_reports(id,schoolId,title,content,filters,generatedById,isRead)

── DÉCISION ──
• ANALYSE : Interprète la question en corrigeant mentalement les fautes d'orthographe (ex: "wifif" -> "wifi", "salls" -> "salle", "proble" -> "problème", "eval" -> "évaluation") pour identifier les entités.
• Salutation/Hors-sujet/Blague → retourne EXACTEMENT: NO_QUERY
• Signalement/Suggestion → retourne un résumé court suivi OBLIGATOIREMENT du bloc :
  \`\`\`json_action
  {"type":"CREATE_REPORT","payload":{"title":"...","content":"...","type":"TYPE","priority":"PRIORITÉ"}}
  \`\`\`
  Exemple: "Je m'en occupe. \`\`\`json_action {"type":"CREATE_REPORT","payload":{...}} \`\`\`"
  Types: PROBLEM_MATERIAL, PROBLEM_ADMIN, PROBLEM_PEDAGOGICAL, INCIDENT, SUGGESTION, OTHER.
  Priorités: LOW, MEDIUM, HIGH, CRITICAL.
  (Titre min 8 car, Contenu min 15 car. Étoffe intelligemment si l'utilisateur est bref.)
• Évaluation → retourne bloc json_action avec type "CREATE_EVALUATION" si les détails sont fournis.
• Toute question sur les données (historique, status, comptage) → génère le SQL.
`.trim();
}

// ─── Response Prompt ──────────────────────────────────────────────────────────

// AMÉLIORATION #4 : Prompt de réponse plus directif et mieux structuré.
// On distingue clairement les cas : vide, erreur, données présentes.
function buildResponsePrompt(
  systemIdentity: string,
  dbDataStr: string,
  historyBlock: string,
  question: string,
  schoolName: string,
  isGeneral: boolean,
  hasChart: boolean,
  role: string,
  isStudent: boolean = false
): string {
  const userPersona = isStudent
    ? "Tu parles à un ÉTUDIANT : ton ton est encourageant, clair et bienveillant."
    : `Tu parles à un ${role} : ton ton est précis, analytique et professionnel.`;

  if (isGeneral) {
    return `${systemIdentity}
${userPersona}
${SCHOOL_KNOWLEDGE}
${historyBlock ? `HISTORIQUE RÉCENT:\n${historyBlock}\n` : ''}
QUESTION: ${question}

RÈGLES:
- Réponds en français, en 1 à 3 phrases maximum.
- Salutation → réponse chaleureuse courte (1 phrase).
- Question sur l'école (adresse/filières/règlement) → utilise les données publiques ci-dessus.
- "Qui es-tu / Que peux-tu faire" → explique que tu es MyIA, assistant de "${schoolName}", capable de consulter les évaluations, signalements, statistiques et règlements.
- Hors-sujet ou blague → réponds directement et brièvement, sans mentionner tes fonctions.
- JAMAIS de formatting JSON, ou listes techniques.
- Utilise des emojis pour rendre les listes plus lisibles si nécessaire.`;
  }

  const dataSection = dbDataStr === 'Aucun résultat trouvé.'
    ? `DONNÉES: Aucun résultat.`
    : dbDataStr.includes('erreur technique')
      ? `DONNÉES: Erreur technique.`
      : `DONNÉES (JSON):\n${dbDataStr}`;

  const chartNote = hasChart
    ? `\n- GRAPHIQUE: Un graphique a été généré. Mentionne-le en une phrase ("Voici le graphique correspondant 📊").`
    : '';

  return `${systemIdentity}
${userPersona}

${dataSection}
${historyBlock ? `HISTORIQUE RÉCENT:\n${historyBlock}\n` : ''}
QUESTION: ${question}

══ RÈGLES DE RÉPONSE ══
ÉTAPE 1 — VÉRIFICATION DES DONNÉES:
  • JSON vide ou "Aucun résultat" → réponds UNIQUEMENT: "Aucune donnée disponible pour cette demande."
  • "Erreur technique" → réponds UNIQUEMENT: "Je ne peux pas récupérer cette information pour le moment."
  • Données présentes → passe à l'étape 2.

ÉTAPE 2 — ANALYSE ET RÉPONSE:
  • Lis TOUTES les lignes du JSON avant de répondre.
  • Si plusieurs lignes → CITE-LES TOUTES par ordre d'importance.
  • Ex-aequo de valeurs → mentionne "à égalité".
  • Donne des chiffres précis (pas "environ" ou "pas beaucoup").
  • Si classement → liste complète avec rang, nom et valeur.
  • Si tendance → décris direction (hausse/baisse/stable) + valeur min, max, et point notable.
  • Si comptage → donne le chiffre exact + contexte (ex: "sur ${role === 'STUDENT' ? 'votre classe' : 'l\'ensemble de l\'école'}").

ÉTAPE 3 — FORMAT:
  • Langue: français uniquement.
  • Longueur: 2 à 6 phrases pour questions simples, liste structurée pour classements/comparaisons.
  • Émojis pour listes (📍 🎓 📊 ✅ ⚠️ 📈).
  • Tu PEUX utiliser le markdown standard (* ou - pour les listes, ** pour le gras) pour rendre la réponse belle et lisible.
  • ZÉRO UUID, ZÉRO ID technique (ID numérique), ZÉRO nom de table SQL.
  • ZÉRO syntaxe technique ou mention de base de données.
  • Ton ton est direct et professionnel. Ne dis jamais "D'après les données".
  • Établissement: "${schoolName}".${chartNote}

⚠️ RÈGLE CRITIQUE ACTIONS : Si l'utilisateur exprime une volonté de créer un rapport/évaluation et que tu as assez d'infos, ajoute TOUJOURS le bloc \`\`\`json_action ... \`\`\` à la fin de ta réponse.`;
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
  const safe = upper.startsWith('SELECT') &&
    !upper.includes('DROP ') && !upper.includes('DELETE ') &&
    !upper.includes('UPDATE ') && !upper.includes('INSERT ') &&
    !upper.includes('TRUNCATE ') && !upper.includes('ALTER ');

  if (!safe) return { data: 'Requête bloquée (SELECT uniquement).', executedSql: '', rawRows: [] };

  const serialize = (rows: any[]) => {
    const s = JSON.stringify(rows, (_k, v) => typeof v === 'bigint' ? v.toString() : v);
    // AMÉLIORATION #6 : Limite augmentée à 10k car. pour les réponses riches (classements longs)
    const t = s.length > 10000 ? s.substring(0, 10000) + '… (tronqué)' : s;
    return t === '[]' ? 'Aucun résultat trouvé.' : t;
  };

  try {
    console.log('⚡ SQL attempt 1:', sql);
    const rows = await prisma.$queryRawUnsafe(sql) as any[];
    return { data: serialize(rows), executedSql: sql, rawRows: rows };
  } catch (e1: any) {
    console.error('❌ SQL Error (1):', e1.message);
    try {
      // AMÉLIORATION #7 : Prompt de retry plus ciblé sur l'erreur réelle
      const retryPrompt = `${sqlSystemPrompt}

ERREUR SQL: "${e1.message}"
SQL EN ERREUR:
\`\`\`sql
${sql}
\`\`\`

CORRECTIONS FRÉQUENTES:
- evaluation_campaigns → JOIN professors p ON ec."professorId"=p.id WHERE p."schoolId"='${schoolId}'
- classes → JOIN campuses ca ON cl."campusId"=ca.id WHERE ca."schoolId"='${schoolId}'
- Guillemets doubles sur toutes colonnes camelCase (firstName, lastName, schoolId, etc.)
- CAST(col AS TEXT) sur tous les enums (status, priority, type, role, scope...)
- reports.authorId (PAS userId), reports n'a PAS campaignId
- ORDER BY : réécris l'expression complète, pas un alias calculé

QUESTION ORIGINALE: ${question}
Génère UNIQUEMENT la requête SQL corrigée, rien d'autre.`;

      const retryRes = await aiBalancer.callAI(retryPrompt, schoolId);
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
      INSERT INTO ai_conversations (id,"schoolId","userId",title,"createdAt","updatedAt")
      VALUES ('${id}','${schoolId}','${userId}','${title.replace(/'/g, "''")}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
      INSERT INTO ai_messages (id,"conversationId",role,content,"createdAt")
      VALUES ('${id}','${conversationId}','${role}','${content.replace(/'/g, "''")}', CURRENT_TIMESTAMP)
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
        UPDATE ai_conversations SET "sqlContext"='${json}', "updatedAt"=CURRENT_TIMESTAMP WHERE id='${convId}'
      `);
    } catch { /* ignore */ }
  },

  // ── MAIN ─────────────────────────────────────────────────────────────────

  async askDirect(
    question: string,
    schoolId: string,
    userId: string,
    conversationId?: string,
    filters?: { campusIds?: string[] }
  ) {
    await this.ensureSchema();

    // School name
    let schoolName = "l'établissement";
    try {
      const s = await systemService.getPublicSettings(schoolId);
      schoolName = s.schoolName || schoolName;
    } catch { /* default */ }

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, classId: true, campuses: { select: { id: true } } }
    });

    const userRole = user?.role || 'VIEWER';
    const isStudent = userRole === 'STUDENT';
    const isSuperAdmin = userRole === 'SUPERADMIN';
    const authorizedCampusIds = user?.campuses.map(c => c.id) || [];

    let effectiveCampusIds: string[] = [];
    if (filters?.campusIds && filters.campusIds.length > 0) {
      if (isSuperAdmin || (userRole === 'ADMIN' && authorizedCampusIds.length === 0)) {
        effectiveCampusIds = filters.campusIds;
      } else if (authorizedCampusIds.length > 0) {
        effectiveCampusIds = filters.campusIds.filter(id => authorizedCampusIds.includes(id));
        if (effectiveCampusIds.length === 0) effectiveCampusIds = authorizedCampusIds;
      }
    } else {
      effectiveCampusIds = authorizedCampusIds;
    }

    if (isStudent && authorizedCampusIds.length > 0) {
      effectiveCampusIds = effectiveCampusIds.filter(id => authorizedCampusIds.includes(id));
      if (effectiveCampusIds.length === 0) effectiveCampusIds = authorizedCampusIds;
    }

    const effectiveClassId = isStudent ? user?.classId : null;

    // Conversation
    let convId = conversationId;
    if (!convId) {
      const c = await this.createConversation(schoolId, userId, question);
      convId = c.id;
    }

    // History — AMÉLIORATION #8 : Limite à 10 messages (5 tours) au lieu de 20
    let history: Array<{ role: string; content: string }> = [];
    try {
      history = await prisma.$queryRaw<any[]>`
        SELECT role, content FROM ai_messages
        WHERE "conversationId"=${convId} ORDER BY "createdAt" ASC LIMIT 10
      `;
    } catch { /* none */ }

    const ctx = await this.loadSqlContext(convId as string);
    await this.addMessage(convId as string, 'user', question);

    const { aiBalancer } = await import('../../core/ai/AiBalancer');
    const systemIdentity = `Tu es MyIA, l'Assistant IA officiel de "${schoolName}". Tu es un expert en pilotage pédagogique, analyse des signalements et suivi des évaluations.`;
    const historyBlock = formatHistory(history);

    let answer = '';
    let isGeneral = false;
    let chartData: ChartData | null = null;

    try {
      // AMÉLIORATION #9 : Pré-classification locale pour éviter un appel IA inutile
      const localIntent = classifyIntentLocally(question);

      // Court-circuit immédiat pour les salutations évidentes
      if (localIntent === 'GENERAL') {
        isGeneral = true;
        const finalPrompt = buildResponsePrompt(
          systemIdentity, '', historyBlock, question, schoolName, true, false, userRole, isStudent
        );
        const finalRes = await aiBalancer.callAI(finalPrompt, schoolId);
        answer = finalRes.content.trim().replace(/\*/g, '');
        await this.addMessage(convId as string, 'assistant', answer);
        return { answer, conversationId: convId as string, usedDB: false, schoolName, chartData: null };
      }

      // ── Étape 1 : SQL ──────────────────────────────────────────────────────
      const sqlSystemPrompt = buildSqlPrompt(
        schoolId, ctx, userId, userRole, effectiveCampusIds, effectiveClassId
      );

      // AMÉLIORATION #10 : User prompt SQL plus court et actionnable
      const sqlUserPrompt = [
        historyBlock ? `HISTORIQUE:\n${historyBlock}\n` : '',
        `QUESTION: ${question}`,
        '',
        localIntent === 'ACTION'
          ? '→ Détecte le signalement/suggestion et génère le json_action.'
          : '→ Génère le SQL adapté, ou NO_QUERY si hors-sujet.',
      ].filter(Boolean).join('\n');

      const sqlRes = await aiBalancer.callAI(`${sqlSystemPrompt}\n\n${sqlUserPrompt}`, schoolId);
      const sqlContent = sqlRes.content.trim();

      let dbDataStr = '';
      let executedSql = '';

      if (sqlContent.includes('NO_QUERY')) {
        isGeneral = true;
      } else if (sqlContent.includes('json_action')) {
        answer = sqlContent.replace(/\*/g, '');
        await this.addMessage(convId as string, 'assistant', answer);
        return { answer, conversationId: convId as string, usedDB: false, schoolName, chartData: null };
      } else if (sqlContent.includes('INTENT_ACTION')) {
        dbDataStr = 'USER_WANTS_ACTION';
      } else {
        const sqlMatch =
          sqlContent.match(/```sql\s*([\s\S]*?)```/i) ||
          sqlContent.match(/(SELECT\s[\s\S]+)/i);

        if (sqlMatch) {
          const sql = (sqlMatch[1] || sqlMatch[0]).replace(/```/g, '').trim();
          const result = await executeSqlWithRetry(sql, question, schoolId, aiBalancer, sqlSystemPrompt);
          dbDataStr = result.data;
          executedSql = result.executedSql;

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
        systemIdentity, dbDataStr, historyBlock, question,
        schoolName, isGeneral, chartData !== null, userRole, isStudent
      );
      const finalRes = await aiBalancer.callAI(finalPrompt, schoolId);
      answer = finalRes.content.trim();
      // Nettoyage final pour le front
      answer = answer.replace(/\*/g, '').trim();
      await this.addMessage(convId as string, 'assistant', answer);

    } catch (e: any) {
      console.error('❌ AI Balancer completely failed:', e.message);
      answer = "Je suis actuellement très sollicité et mes systèmes ont besoin de refroidir un instant. Veuillez réessayer dans une petite minute !";
    }

    return {
      answer,
      conversationId: convId as string,
      usedDB: !isGeneral,
      schoolName,
      chartData,
    };
  },
};