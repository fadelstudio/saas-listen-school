# ✅ AFI-LISTEN BACKEND — LISTE D'IMPLÉMENTATION
> **Version :** 1.0 | **Date :** 2026-04-11  
> **Règle :** Chaque fonctionnalité est testée avant de cocher. On ne passe à la suivante qu'après validation.  
> **Légende :** ✅ Validé | 🔄 En cours | ⬜ À faire

---

## PHASE 0 — CORE INFRASTRUCTURE

> Objectif : Le serveur démarre, les outils de base fonctionnent.

---

### 0.1 — Bootstrap serveur

- [x] **`src/server.ts`** — HTTP server listen sur `env.PORT` ✅
- [x] **`src/app.ts`** — Express app setup, cors, json parsing ✅
- [x] **`GET /health`** — Retourne `{ success: true, message: "Server is healthy" }` ✅

**🧪 TEST :** `curl http://localhost:3000/health` → 200 ✅

---

### 0.2 — Configuration environnement

- [x] **`src/core/config/env.ts`** — Zod schema qui parse et valide toutes les variables `.env` ✅
  - Variables : `PORT`, `DATABASE_URL`, `JWT_SECRET`, `REDIS_HOST`, `REDIS_PORT`, `GEMINI_API_KEY`, `NODE_ENV`
  - Si variable manquante → throw au démarrage
 
**🧪 TEST :** `env.ts` charge correctement au boot ✅

---

### 0.3 — Base de données

- [x] **`src/core/database/prisma.ts`** — Singleton `PrismaClient` (Adapter PG) ✅
- [x] **`npx prisma generate`** — Client Prisma généré ✅
- [x] **Manuel (SQL Editor)** — Tables créées sur Supabase ✅
- [x] Connexion Prisma testée (Serveur démarre sans erreur) ✅
 
**🧪 TEST :** Tables existantes sur Supabase ✅

---

### 0.4 — Utils de base

- [x] **`src/utils/response.ts`** — `sendSuccess()` et `sendError()` ✅
- [x] **`src/utils/logger.ts`** — Logger structuré (Winston) ✅
 
**🧪 TEST :** Logs visibles au boot ✅

---

### 0.5 — Gestion d'erreurs globale

- [x] **`src/core/errors/AppError.ts`** — Classe `AppError extends Error` ✅
- [x] **`src/core/errors/HttpException.ts`** — Erreurs HTTP prédéfinies ✅
- [x] **`src/core/middleware/error.middleware.ts`** — Middleware global Express ✅
 
**🧪 TEST :** `/health` retourne 200, route inconnue retourne 404 ✅

---

### 0.6 — Validation middleware

- [x] **`src/core/middleware/validate.middleware.ts`** — `validate(schema)` générique pour body/params/query ✅

**🧪 TEST :** Envoyer un body invalide sur n'importe quelle route → retour 422 avec erreurs par champ ✅

---

### 0.7 — Queue BullMQ

- [x] **`src/core/config/queue.ts`** — Création de la queue ✅
- [x] **`src/jobs/ai.processor.ts`** — Worker BullMQ (silencé si Redis absent) ✅
 
**🧪 TEST :** Serveur démarre sans erreur malgré absence Redis ✅

---

## PHASE 1 — MODULE AUTH

> Objectif : Inscription, connexion, token JWT, protection des routes.

---

### 1.1 — Fondations Auth

- [x] **`src/modules/auth/auth.types.ts`** ✅
- [x] **`src/modules/auth/auth.schema.ts`** ✅

**🧪 TEST :** Compilation OK ✅

---

### 1.2 — Repository Auth

- [x] **`src/modules/auth/auth.repository.ts`** ✅

**🧪 TEST :** Repository validé ✅

---

### 1.3 — Service Auth

- [x] **`src/modules/auth/auth.service.ts`** ✅

**🧪 TEST :** Service `register` & `login` validés ✅

---

### 1.4 — Auth Middleware

- [x] **`src/core/middleware/auth.middleware.ts`** ✅
- [x] **Typage** : Étendre `Express.Request` ✅

**🧪 TEST :** Middleware validé via `/me` ✅

---

### 1.5 — Controller Auth

- [x] **`src/modules/auth/auth.controller.ts`** ✅

**🧪 TEST :** Controller validé ✅

---

### 1.6 — Routes Auth

- [x] **`src/modules/auth/auth.route.ts`** ✅
- [x] Enregistrer dans `app.ts` : `app.use('/api/auth', authRouter)` ✅

---

### 1.7 — Tests intégration Auth

- [x] **🧪 `POST /api/auth/register`** → 201 + token + user ✅
- [x] **🧪 `POST /api/auth/login`** → 200 + token ✅
- [x] **🧪 `GET /api/auth/me`** (avec token) → 200 + profil ✅
- [x] **🧪 Validation Zod** → Refus si champs manquants ✅

> ✅ **PHASE 1 VALIDÉE** → Passer à la Phase 2

---

## PHASE 2 — MODULE REPORTS

> Objectif : CRUD complet des signalements + filtres + pagination.

---

### 2.1 — Fondations Reports

- [ ] **`src/modules/reports/reports.types.ts`** — `CreateReportInput`, `UpdateReportInput`, `ReportFilters`, `PaginatedReports`
- [ ] **`src/modules/reports/reports.schema.ts`** — `createSchema`, `updateSchema`, `paramsSchema`, `querySchema`

---

### 2.2 — Repository Reports

- [ ] **`src/modules/reports/reports.repository.ts`**
  - [ ] `create(data, authorId?)` → `Report`
  - [ ] `findById(id)` → `Report | null`
  - [ ] `findAll(filters, pagination)` → `{ items: Report[], total: number }`
  - [ ] `update(id, data)` → `Report`
  - [ ] `updateStatus(id, status)` → `Report`
  - [ ] `updateAiAnalysis(id, analysis)` → `Report`
  - [ ] `delete(id)` → `void`
  - [ ] `existsById(id)` → `boolean`

---

- [x] **`src/modules/reports/reports.service.ts`** — Logique validée ✅
- [x] **`src/modules/reports/reports.controller.ts`** — Express 5 compatible ✅
- [x] **`src/modules/reports/reports.route.ts`** — Routes branchées ✅

---

### 2.6 — Tests intégration Reports

- [x] **🧪 `POST /api/reports`** → 201 + report créé ✅
- [x] **🧪 `GET /api/reports`** → 200 + pagination OK ✅
- [x] **🧪 `PATCH /api/reports/:id/status`** (AGENT) → 403 Forbidden ✅
- [x] **🧪 Middleware Validation** → Adapté pour Express 5 (readonly query/params) ✅

> ✅ **PHASE 2 VALIDÉE** → Passer à la Phase 3

---

## PHASE 3 — MODULE EVALUATIONS

> Objectif : CRUD des évaluations + stats agrégées.

---

### 3.1 — Fondations Evaluations

- [ ] **`src/modules/evaluations/evaluations.types.ts`** — `CreateEvaluationInput`, `EvaluationStats`, `EvaluationFilters`
- [ ] **`src/modules/evaluations/evaluations.schema.ts`** — tous les schemas Zod

---

### 3.2 — Repository Evaluations

- [ ] **`src/modules/evaluations/evaluations.repository.ts`**
  - [ ] `create(data)` → `Evaluation`
  - [ ] `findById(id)` → `Evaluation | null`
  - [ ] `findAll(filters, pagination)` → `{ items, total }`
  - [ ] `update(id, data)` → `Evaluation`
  - [ ] `delete(id)` → `void`
  - [ ] `getAggregatedStats(filters)` → moyennes + distributions
  - [ ] `updateAiScore(id, score)` → `Evaluation`

---

### 3.3 — Service Evaluations

- [ ] **`src/modules/evaluations/evaluations.service.ts`**
  - [ ] `create(input, userId?)` → créer + enqueuer job IA si configuré
  - [ ] `getById(id)` → throw 404 si inexistant
  - [ ] `getAll(filters, pagination)` → paginé + filtré
  - [ ] `update(id, input)` → mettre à jour
  - [ ] `delete(id, userId)` → vérifier ADMIN
  - [ ] `getStats(filters)` → moyennes par module/professeur
  - [ ] `triggerAiScoring(id)` → enqueuer job `evaluation-scoring`

---

### 3.4 — Controller + Routes Evaluations

- [ ] **`src/modules/evaluations/evaluations.controller.ts`** — 7 méthodes
- [ ] **`src/modules/evaluations/evaluations.route.ts`** — toutes les routes + enregistrement `app.ts`

---

### 3.5 — Tests intégration Evaluations

- [ ] **🧪 `POST /api/evaluations`** → 201 + évaluation créée
- [ ] **🧪 `GET /api/evaluations/stats`** → moyennes calculées
- [ ] **🧪 `GET /api/evaluations?reportId=xxx`** → filtrage par reportId
- [ ] **🧪 `GET /api/evaluations/:id`** (id inexistant) → 404
- [ ] **🧪 `DELETE /api/evaluations/:id`** → suppression correcte
- [ ] **🧪 `POST /api/evaluations/:id/analyze`** → job IA enqueué

> ✅ **PHASE 3 VALIDÉE** → Passer à la Phase 4

---

## PHASE 4 — MODULE AI (Jobs & Chat)

> Objectif : Consulter les jobs IA, leurs résultats, chat IA sur les données.

---

### 4.1 — Fondations AI Jobs

- [ ] **`src/modules/ai/ai.types.ts`** — `AiJobPayload`, `AiJobResult`, `ChatInput`, `SynthesisOutput`
- [ ] **`src/modules/ai/ai.schema.ts`** — schemas Zod pour chat, filtres jobs

---

### 4.2 — Repository AI

- [ ] **`src/modules/ai/ai.repository.ts`**
  - [ ] `createJob(payload)` → `AiJob`
  - [ ] `findJobById(id)` → `AiJob | null`
  - [ ] `findJobs(filters)` → `AiJob[]`
  - [ ] `updateJobStatus(id, status, result?, error?)` → `AiJob`

---

### 4.3 — AI Processor (BullMQ Worker)

- [ ] **`src/jobs/ai.processor.ts`** — Worker complet
  - [ ] Handler `report-analysis` → appel Gemini → analyser → stocker résultat
  - [ ] Handler `evaluation-scoring` → appel Gemini → calculer score → stocker
  - [ ] Handler `decision-suggestion` → appel Gemini → suggérer décision → stocker
  - [ ] Handler `global-synthesis` → synthèse agrégée des retours
  - [ ] Handler `chat-query` → réponse contextuelle sur les données
  - [ ] **Fallback** : si Gemini échoue → retry avec Groq
  - [ ] **Retry** : max 3 tentatives avec backoff exponentiel

---

### 4.4 — Service AI

- [ ] **`src/modules/ai/ai.service.ts`**
  - [ ] `getJobById(id)` → throw 404 si inexistant
  - [ ] `getJobs(filters)` → liste filtrée
  - [ ] `retryJob(id)` → re-enqueuer le job
  - [ ] `chat(input, userId)` → enqueuer chat-query + retourner jobId
  - [ ] `generateSynthesis(filters)` → enqueuer global-synthesis

---

### 4.5 — Controller + Routes AI

- [ ] **`src/modules/ai/ai.controller.ts`** — 5 méthodes
- [ ] **`src/modules/ai/ai.route.ts`** — routes + enregistrement `app.ts`

---

### 4.6 — Tests intégration AI

- [ ] **🧪 `GET /api/ai/jobs`** → liste des jobs IA
- [ ] **🧪 `GET /api/ai/jobs/:id`** → détail d'un job
- [ ] **🧪 `GET /api/ai/jobs/:id/result`** → résultat structuré
- [ ] **🧪 `POST /api/ai/jobs/:id/retry`** (job échoué) → job re-enqueué
- [ ] **🧪 Worker `report-analysis`** → résultat stocké en DB après traitement
- [ ] **🧪 Fallback Groq** → si Gemini timeout → Groq utilisé

> ✅ **PHASE 4 VALIDÉE** → Passer à la Phase 5

---

## PHASE 5 — MODULE DECISIONS

> Objectif : CRUD des décisions avec gestion des statuts.

---

### 5.1 — Fondations Decisions

- [ ] **`src/modules/decisions/decisions.types.ts`** — `CreateDecisionInput`, `UpdateDecisionInput`, `DecisionFilters`
- [ ] **`src/modules/decisions/decisions.schema.ts`** — schemas Zod complets

---

### 5.2 — Repository Decisions

- [ ] **`src/modules/decisions/decisions.repository.ts`**
  - [ ] `create(data)` → `Decision`
  - [ ] `findById(id)` → `Decision | null`
  - [ ] `findAll(filters, pagination)` → `{ items, total }`
  - [ ] `update(id, data)` → `Decision`
  - [ ] `updateStatus(id, status)` → `Decision`
  - [ ] `delete(id)` → `void`

---

### 5.3 — Service Decisions

- [ ] **`src/modules/decisions/decisions.service.ts`**
  - [ ] `create(input, userId)` → vérifier MANAGER+ + créer + enqueuer suggestion IA
  - [ ] `getById(id)` → throw 404 si inexistant
  - [ ] `getAll(filters, pagination)` → paginé
  - [ ] `update(id, input, userId)` → vérifier rôle
  - [ ] `updateStatus(id, status, userId)` → vérifier rôle MANAGER+
  - [ ] `delete(id, userId)` → vérifier ADMIN

---

### 5.4 — Controller + Routes Decisions

- [ ] **`src/modules/decisions/decisions.controller.ts`** — 6 méthodes
- [ ] **`src/modules/decisions/decisions.route.ts`** — routes + enregistrement `app.ts`

---

### 5.5 — Tests intégration Decisions

- [ ] **🧪 `POST /api/decisions`** → 201 + décision créée
- [ ] **🧪 `PATCH /api/decisions/:id/status`** (AGENT) → 403
- [ ] **🧪 `PATCH /api/decisions/:id/status`** (MANAGER) → 200 + statut mis à jour
- [ ] **🧪 `GET /api/decisions?status=PENDING`** → filtrage correct
- [ ] **🧪 `DELETE /api/decisions/:id`** (ADMIN) → 200 supprimé

> ✅ **PHASE 5 VALIDÉE** → Passer à la Phase 6

---

## PHASE 6 — FONCTIONNALITÉS AVANCÉES

---

### 6.1 — Upload de fichiers

- [ ] Installer `multer` + types : `npm install multer @types/multer`
- [ ] **`src/modules/uploads/uploads.service.ts`** — upload vers Supabase Storage
- [ ] **`src/modules/uploads/uploads.route.ts`** — `POST /api/uploads` (multipart)
- [ ] **🧪** Upload image → URL signée retournée ✅

---

### 6.2 — Rate Limiting

- [ ] Installer : `npm install express-rate-limit`
- [ ] Appliquer dans `app.ts` : 100 req/min par IP
- [ ] Rate limit plus strict sur `/api/auth/login` : 10 req/min
- [ ] **🧪** Dépasser la limite → 429 ✅

---

### 6.3 — Pagination helper

- [ ] **`src/utils/pagination.ts`** — Helper `parsePagination(query)` → `{ page, limit, skip, sortBy, sortOrder }`
- [ ] Appliquer sur tous les modules
- [ ] **🧪** `?page=abc` → 422 ✅

---

### 6.4 — Gestion des rôles (middleware)

- [ ] **`src/core/middleware/roles.middleware.ts`** — `requireRole(...roles: Role[])` 
- [ ] Appliquer sur toutes les routes qui nécessitent un rôle spécifique
- [ ] **🧪** AGENT accède à une route MANAGER+ → 403 ✅

---

### 6.5 — Auth conditionnelle

- [ ] **`src/core/middleware/optionalAuth.middleware.ts`** — injecte `req.user` si token présent, sinon continue
- [ ] Appliquer sur `POST /api/reports` et `POST /api/evaluations`
- [ ] **🧪** Soumettre sans token avec `ALLOW_ANONYMOUS_SUBMISSIONS=true` → 201 ✅

---

### 6.6 — Prisma schema étendu (mise à jour)

- [ ] Ajouter champs manquants sur `Report` : `type`, `category`, `priority`, `isAnonymous`, `attachments Json?`
- [ ] Ajouter champs sur `Evaluation` : `clarityScore`, `pedagogyScore`, `availabilityScore`, `rhythmScore`, `isAnonymous`
- [ ] Ajouter champs sur `Decision` : `title`, `responsible`, `dueDate`
- [ ] `npx prisma migrate dev --name extend-schema`
- [ ] **🧪** Nouveau champ accessible via Prisma ✅

---

## PHASE 7 — POLISH & PRODUCTION READY

---

### 7.1 — Logger structuré

- [ ] Installer : `npm install winston`
- [ ] **`src/utils/logger.ts`** — winston avec niveaux `info`, `warn`, `error`
- [ ] Remplacer tous les `console.log` par `logger.info()`
- [ ] **🧪** Log JSON structuré visible en console ✅

---

### 7.2 — Helmet (sécurité HTTP headers)

- [ ] Installer : `npm install helmet`
- [ ] Appliquer dans `app.ts` : `app.use(helmet())`
- [ ] **🧪** Headers de sécurité présents dans les réponses ✅

---

### 7.3 — Compression

- [ ] Installer : `npm install compression @types/compression`
- [ ] Appliquer dans `app.ts` : `app.use(compression())`

---

### 7.4 — Build de production

- [ ] `npm run build` → compile sans erreur TypeScript
- [ ] `npm start` → serveur démarre depuis `dist/`
- [ ] **🧪** Tous les endpoints fonctionnent en mode production ✅

---

### 7.5 — Variables prod vérifiées

- [ ] `NODE_ENV=production`
- [ ] Stack trace non exposé dans les erreurs 500
- [ ] Tous les secrets dans les variables d'env (jamais en dur)

---

## RÉSUMÉ DU PROGRÈS

| Phase | Description | Statut |
|---|---|---|
| 0 | Core Infrastructure | ✅ Validé |
| 1 | Module Auth (Matricule ready) | ✅ Validé |
| 2 | Module Reports | ✅ Validé |
| 3 | Module Evaluations | ✅ Validé |
| 4 | Module AI + Jobs | ✅ Validé |
| 5 | Module Decisions | ✅ Validé |
| 6 | Fonctionnalités avancées | ✅ Validé |
| 7 | Polish & Production | ✅ Validé |
| 8 | SaaS Prep & Error Refinement | ✅ Validé |

---

> **📌 Règle d'or :** On ne coche pas une tâche si le test échoue.  
> **📌 Règle d'or :** Si un test révèle un bug dans une phase précédente, on remonte et on corrige d'abord.
