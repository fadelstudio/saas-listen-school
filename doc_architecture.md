# 🏛️ DOCUMENT D'ARCHITECTURE — AFI-LISTEN
## Hackathon AFI-TECH 2026 | Thème : Application mobile et Dashboard IA pour écouter les étudiants africains

---

> **Vision** : AFI-LISTEN est un écosystème numérique complet — backend API, dashboard web administratif et application mobile étudiante — conçu pour collecter, analyser et transformer les retours des étudiants en décisions stratégiques à forte valeur ajoutée, grâce à l'intelligence artificielle.

---

## 1. VUE D'ENSEMBLE DE LA PLATEFORME

AFI-LISTEN est composé de **trois piliers technologiques** interdépendants :

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PLATEFORME AFI-LISTEN                        │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  📱 MOBILE   │    │  🖥️  DASHBOARD   │    │  ⚙️  BACKEND API │  │
│  │   Flutter    │◄──►│    Next.js 16    │◄──►│ Express / Node   │  │
│  │  (Étudiant)  │    │  (Admin/Manager) │    │   TypeScript     │  │
│  └──────────────┘    └──────────────────┘    └──────────────────┘  │
│         │                    │                        │             │
│         └────────────────────┴────────────────────────┘            │
│                               │                                     │
│              ┌────────────────▼────────────────┐                   │
│              │      REST API (JSON/HTTPS)       │                   │
│              │   Multi-tenant · Versionné · IA  │                   │
│              └────────────────────────────────-─┘                   │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐  │
│  │  PostgreSQL │  │   Supabase   │  │  Redis   │  │  Firebase  │  │
│  │  (Prisma)   │  │  (Storage)   │  │  (BullMQ)│  │   (FCM)    │  │
│  └─────────────┘  └──────────────┘  └──────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. STACK TECHNOLOGIQUE COMPLET

### 2.1 Backend — Serveur API

| Composant | Technologie | Version | Rôle |
|-----------|------------|---------|------|
| Runtime | Node.js | v20+ LTS | Exécution serveur |
| Langage | TypeScript | 6.x | Typage statique, maintenabilité |
| Framework HTTP | Express.js | 5.x | API REST, routing, middleware |
| ORM | Prisma | 7.x | Modélisation BDD, migrations |
| Base de données | PostgreSQL | 15+ | Stockage relationnel principal |
| Connexion Pool | PgBouncer (Supabase) | — | Pool de connexions (port 6543) |
| Cache/Queue | Redis (ioredis) | 5.x | Sessions AI, cache balancer |
| Job Queue | BullMQ | 5.x | Traitement IA asynchrone |
| Authentification | JWT (jsonwebtoken) | 9.x | Access + Refresh tokens |
| Hachage | bcrypt | 6.x | Mots de passe (12 rounds) |
| Stockage fichiers | Supabase Storage | 2.x | Avatars, pièces jointes |
| Push Notifications | Firebase Admin SDK | 13.x | Notifications mobile |
| Email | Nodemailer + Brevo | — | OTP, reset password |
| Validation | Zod | 4.x | Schémas d'entrée stricts |
| Logging | Winston | 3.x | Logs structurés |
| Documentation | Swagger/OpenAPI | 3.x | API auto-documentée |
| Sécurité HTTP | Helmet | 8.x | Headers de sécurité |
| Rate Limiting | express-rate-limit | 8.x | Anti-DDoS / brute-force |
| Compression | compression | 1.x | GZIP réponses |
| Auth Google | google-auth-library | 9.x | OAuth2 / OIDC |

### 2.2 Dashboard Web — Interface Administrateur

| Composant | Technologie | Version | Rôle |
|-----------|------------|---------|------|
| Framework | Next.js | 16.x | SSR/SSG, routing App Router |
| Langage | TypeScript | 5.x | Typage statique |
| UI | React | 19.x | Composants interface |
| Style | TailwindCSS | 4.x | Design system utilitaire |
| Charts | ApexCharts + Recharts | 5.x / 3.x | Visualisations analytiques |
| State | Zustand | 5.x | Store global léger |
| Data Fetching | TanStack Query | 5.x | Cache, synchronisation serveur |
| HTTP Client | Axios | 1.x | Requêtes API |
| Formulaires | React Hook Form + Zod | 7.x / 4.x | Validation côté client |
| Animations | Framer Motion | 12.x | Micro-animations |
| Notifications | React Hot Toast | 2.x | Feedback utilisateur |
| Auth Client | NextAuth.js | 5.x | Gestion session web |
| Icônes | Lucide React + Remixicon | — | Bibliothèques d'icônes |
| Notifications Push | Firebase (client SDK) | 12.x | Réception push web |

### 2.3 Application Mobile — Espace Étudiant

| Composant | Technologie | Version | Rôle |
|-----------|------------|---------|------|
| Framework | Flutter | SDK 3.9+ | UI cross-platform |
| Langage | Dart | 3.x | Développement mobile |
| Navigation | go_router | 17.x | Routing déclaratif |
| State | Flutter Riverpod | 3.x | Gestion d'état réactive |
| HTTP Client | Dio | 5.x | Requêtes API + intercepteurs |
| Persistance locale | SharedPreferences | 2.x | Cache local, tokens |
| Typographie | Google Fonts | 8.x | Polices premium |
| Notifications | Firebase Messaging + local_notifications | 15.x / 18.x | Push multi-états |
| OTP Input | Pinput | 6.x | Saisie code 6 chiffres |
| Images | image_picker | 1.x | Galerie / caméra |
| Animations | Lottie | 3.x | Animations JSON |
| Feedback | Toastification | 3.x | Notifications in-app |
| Loader | Shimmer | 3.x | Squelettes de chargement |
| Timing | timeago | 3.x | Dates relatives |

---

## 3. ARCHITECTURE DE LA BASE DE DONNÉES

### 3.1 Modèle de données principal (18 entités)

```
HIÉRARCHIE MULTI-TENANT
━━━━━━━━━━━━━━━━━━━━━━━━
School (AFI, ISI, ...)
  └── Campus (Dakar, Thiès, ...)
        └── Class (L3 Info, M1 Marketing, ...)
              └── ClassModule (Module × Classe)
                    └── Professor (assigné à une classe+module)

UTILISATEURS
━━━━━━━━━━━━
User [SUPERADMIN | ADMIN | MANAGER | AGENT | STUDENT | VIEWER | PROFESSOR]
  ├── RefreshToken (sessions)
  ├── LoginOtpChallenge (vérification email)
  └── PasswordResetToken

SIGNALEMENTS & ÉVALUATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Report ──────────────────── Decision
  └── AiJob                   └── AiJob
Evaluation ──────────────── Decision
  └── EvaluationCampaign
        └── Notification (broadcast ciblé)

IA & ANALYTIQUE
━━━━━━━━━━━━━━
AiConversation
  └── AiMessage
AnalysisReport
  └── Decision

SYSTÈME
━━━━━━━
SystemSettings (par école : IA, OTP, auth...)
AuditLog (traçabilité)
GuestDevice (UTI invités)
Notification (broadcast multi-cible)
```

### 3.2 Types d'énumérations clés

```
Role:            SUPERADMIN | ADMIN | MANAGER | AGENT | STUDENT | VIEWER | PROFESSOR
ReportType:      PROBLEM_MATERIAL | PROBLEM_ADMIN | PROBLEM_PEDAGOGICAL | INCIDENT | SUGGESTION | OTHER
Priority:        LOW | MEDIUM | HIGH | CRITICAL
ReportStatus:    DRAFT | SUBMITTED | REVIEWED | APPROVED | REJECTED
EvaluationStatus: PENDING | IN_PROGRESS | COMPLETED
DecisionStatus:  PENDING | PROPOSED | APPROVED | REJECTED | IN_PROGRESS | DONE | DEFERRED
RatingBand:      VERY_POOR | POOR | FAIR | GOOD | EXCELLENT   (→ score /20)
AiJobStatus:     QUEUED | PROCESSING | DONE | FAILED
```

---

## 4. ARCHITECTURE MULTI-TENANT (SaaS)

### 4.1 Résolution du tenant (école)

Le middleware `resolveSchool` résout l'école en **4 niveaux de priorité** :

```
Requête HTTP
      │
      ├─ 1. Sous-domaine        → afi.plateforme.com → schoolSlug = "afi"
      ├─ 2. Header HTTP         → x-school-slug: afi
      ├─ 3. Path URL            → /afi/api/v1/...
      └─ 4. Variable d'env      → DEFAULT_SCHOOL_SLUG=afi  (mode non-strict)
                │
                ▼
         prisma.school.findUnique({ where: { slug } })
                │
                ▼
         req.schoolId = school.id → propagé à tous les services
```

### 4.2 Isolation des données

- **Chaque entité** (Report, Evaluation, User, Decision, Notification...) porte un `schoolId`
- Les requêtes filtrées par `schoolId` dans **tous** les services → isolation garantie
- Les `MANAGER/AGENT` sont en plus restreints à leurs `campusIds` (isolation intra-école)
- Les analyses IA portent le `schoolId` dans les prompts SQL → cloisonnement absolu

---

## 5. ARCHITECTURE IA — MOTEUR MULTI-PROVIDER

### 5.1 AiBalancer — Orchestrateur intelligent

```
Admin configure:  [Gemini API Key, priority=1]  +  [Groq API Key, priority=2]
                                 │
                    AiBalancer.buildCascade()
                                 │
                    ModelDiscovery.getTopModels()
                    (cache 1h, top-5 par provider)
                                 │
        ┌────────────────────────┴──────────────────────────┐
        │  Cascade résolue (triée par priorité globale) :   │
        │  1. gemini::gemini-2.5-flash  (priority=100+0)    │
        │  2. gemini::gemini-2.0-flash  (priority=100+1)    │
        │  3. groq::llama-3.3-70b       (priority=200+0)    │
        │  4. groq::mixtral-8x7b        (priority=200+1)    │
        │  ...                                               │
        └────────────────────────────────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │   Fast-path      │   Fallback        │
              │   (dernier OK)   │   (cascade)       │
              └──────────────────┘──────────────────┘
```

### 5.2 Providers supportés

| Provider | Modèles auto-découverts | Cooldown quota | Notes |
|---------|------------------------|----------------|-------|
| **Google Gemini** | gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-pro... | 5 min | Modèle préféré par défaut |
| **Groq** | llama-3.3-70b, mixtral-8x7b, gemma2-9b... | 5 min | Inférence ultra-rapide |
| **OpenAI** | gpt-4o, gpt-4-turbo, gpt-3.5-turbo... | 5 min | Compatible API |
| **Anthropic** | claude-3.5-sonnet, claude-3-haiku... | 5 min | Raisonnement avancé |

### 5.3 Pipeline IA (Chat + Analyse)

```
Question Admin
      │
      ├─ 1. SQL Generation (AI)
      │        └─ Prompt système avec schéma BDD complet
      │        └─ Règles SQL strictes (SELECT only, camelCase, enums...)
      │        └─ Retry automatique si SQL invalide (auto-correction IA)
      │
      ├─ 2. SQL Execution (Prisma)
      │        └─ Validation sécurité (SELECT uniquement, pas de DROP/DELETE)
      │        └─ Sérialisation BigInt
      │
      ├─ 3. Chart Detection (algorithme)
      │        └─ time-series → line chart
      │        └─ distribution → pie/bar chart
      │        └─ ranking → bar chart
      │
      └─ 4. Response Generation (AI)
               └─ Réponse naturelle en français
               └─ Données factuelles uniquement (pas d'invention)
               └─ Action intent → pre-fill formulaire (json_action)
```

### 5.4 Jobs asynchrones (BullMQ + Redis)

```
Reports → AiJob Queue → ai.worker.ts
              ├── report-analysis  : Analyse sémantique du signalement
              ├── evaluation-scoring : Score /20 depuis les RatingBands
              ├── decision-suggestion : Suggestion de décision admin
              └── post-campaign-analysis : Synthèse campagne + décision auto
```

---

## 6. ARCHITECTURE DES MODULES BACKEND (20 modules)

```
src/modules/
├── auth/              → Login, Register, OTP, Google OAuth, Refresh Token
├── school-users/      → CRUD utilisateurs admin/manager/agent
├── reports/           → Signalements (public + authentifié)
├── evaluations/       → Évaluations professeurs (mode campagne + libre)
├── evaluation-campaigns/ → Campagnes d'évaluation (lifecycle complet)
├── decisions/         → Décisions administratives (IA + humain)
├── ai/                → Chat IA (MyIA), conversations, messages
├── analytics/         → Tableaux de bord, KPIs, statistiques
├── notifications/     → Broadcast, ciblage multi-rôle, push FCM
├── system/            → Paramètres école (IA, OTP, auth)
├── campuses/          → CRUD campus
├── classes/           → CRUD classes
├── professors/        → CRUD professeurs
├── levels/            → Niveaux académiques
├── modules/           → Modules académiques
├── class-modules/     → Association classe ↔ module ↔ professeur
├── academic-modules/  → Gestion structure académique
├── bulk-import/       → Import CSV massif étudiants/profs
├── uploads/           → Gestion fichiers (Supabase Storage)
└── saas/              → Configuration multi-tenant SaaS
```

---

## 7. ARCHITECTURE DASHBOARD WEB (Next.js App Router)

```
src/app/
├── [slug]/             → Route multi-tenant dynamique (slug = code école)
│   ├── login/          → Page connexion (email/matricule + Google)
│   ├── register/       → Inscription étudiant
│   └── reset-password/ → Réinitialisation mot de passe
├── (auth)/             → Groupe routé avec authentification
│   └── dashboard/
│       ├── page.tsx              → Vue d'ensemble KPIs
│       ├── reports/              → Gestion signalements
│       ├── evaluations/          → Tableau évaluations
│       ├── evaluation-campaigns/ → Campagnes lifecycle
│       ├── decisions/            → Décisions stratégiques
│       ├── ai/                   → Chat MyIA (NLP + SQL)
│       ├── analytics/            → Graphiques avancés
│       ├── notifications/        → Centre de notifications
│       ├── school-users/         → Gestion utilisateurs
│       ├── professors/           → Gestion professeurs
│       ├── classes/              → Gestion classes/campus
│       └── settings/             → Paramètres système
├── send/               → Portail public (signalement sans compte)
└── saas-setup/         → Onboarding SaaS nouvelle école
```

---

## 8. ARCHITECTURE APPLICATION MOBILE (Flutter)

```
lib/
├── core/
│   ├── api_client.dart      → Client Dio avec intercepteurs (auth, refresh)
│   ├── api_endpoints.dart   → Constantes URL
│   ├── router.dart          → go_router (routing déclaratif)
│   ├── theme.dart           → Dark/Light mode, Material 3
│   └── logger.dart          → Logger structuré
├── models/                  → DTOs (Campaign, Evaluation, Report, User...)
├── services/
│   ├── auth_service.dart       → Login, Register, OTP, Google, Refresh
│   ├── report_service.dart     → Signalements (auth + invité)
│   ├── campaign_service.dart   → Campagnes + soumission évaluation
│   ├── notification_service.dart → FCM + push local
│   └── cache_service.dart      → Cache offline (SharedPreferences)
├── screens/
│   ├── splash/              → Écran de démarrage + UTI guest
│   ├── onboarding/          → Présentation de l'app
│   ├── auth/                → Login, Register, OTP, Google
│   ├── guest/               → Formulaire signalement sans compte
│   └── student/
│       ├── student_shell.dart   → Navigation principale (tabs)
│       ├── home/            → Accueil étudiant + stats personnelles
│       ├── campaigns/       → Liste campagnes + formulaire évaluation
│       ├── reports/         → Historique signalements
│       └── profile/         → Profil + paramètres
└── widgets/                 → Composants réutilisables
```

---

## 9. INFRASTRUCTURE & DÉPLOIEMENT

### 9.1 Architecture Cloud (Production)

```
Internet
    │
    ├── Dashboard Web ──────► Vercel / Render (Next.js SSR)
    │
    ├── Mobile App ──────────► Google Play Store / Apple App Store (Flutter)
    │
    └── Backend API ─────────► Render.com
            │
            ├── Service API  (render: web, port 10000)
            │       └── npx prisma migrate deploy && node dist/server.js
            │
            ├── Service Worker (render: worker)
            │       └── node dist/jobs/ai.worker.js
            │
            ├── PostgreSQL ──────► Supabase (transaction mode port 6543)
            │       └── Direct URL (port 5432, migrations uniquement)
            │
            ├── Redis ───────────► Render Redis (ou Upstash)
            │       └── DB 0 (BullMQ queues + AI balancer state)
            │
            └── Fichiers ────────► Supabase Storage
                    └── Buckets : avatars, attachments, logos
```

### 9.2 Configuration CI/CD (render.yaml)

```yaml
services:
  - type: web         # API REST
    buildCommand: npm ci && npx prisma generate && npm run build
    startCommand: npx prisma migrate deploy && node dist/server.js
    healthCheckPath: /health

  - type: worker      # Traitement IA asynchrone
    buildCommand: npm ci && npx prisma generate && npm run build
    startCommand: node dist/jobs/ai.worker.js
```

### 9.3 Variables d'environnement critiques

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | PostgreSQL transaction mode (port 6543) |
| `DIRECT_URL` | PostgreSQL session mode (port 5432, migrations) |
| `JWT_SECRET` | Signature tokens JWT |
| `SUPABASE_URL / SUPABASE_KEY` | Storage fichiers |
| `GEMINI_API_KEY` | Provider IA principal |
| `GROQ_API_KEY` | Provider IA fallback |
| `REDIS_URL` | BullMQ + cache balancer |
| `DEFAULT_SCHOOL_SLUG` | Tenant par défaut (mode non-strict) |
| `TENANT_STRICT_MODE` | Multi-tenant strict / permissif |
| `LOGIN_OTP_ENABLED` | Force OTP global |
| `OTP_FALLBACK_CODE` | Code bypass développement |
| `FIREBASE_ADMIN_SDK` | Push notifications |

---

## 10. FLUX DE DONNÉES PRINCIPAUX

### Flux 1 : Signalement Étudiant → Décision Admin

```
[📱 Étudiant] ──► POST /api/reports ──► Backend
                                             │
                                    Sauvegarde Report
                                             │
                                    AiJob → BullMQ Queue
                                             │
                                    [⚙️ Worker] Analyse IA
                                             │
                                    Report.aiAnalysis = {...}
                                             │
                                    [🖥️ Admin] Notification push
                                             │
                              Admin consulte → Crée Decision
                                             │
                                    Decision.status = PROPOSED
                                    (IA a suggéré le titre+rationale)
```

### Flux 2 : Campagne d'Évaluation → Rapport IA

```
[Admin] Crée EvaluationCampaign (scope: CLASS/CAMPUS/SCHOOL)
                │
    Notifications push → tous les étudiants concernés (FCM)
                │
[📱 Étudiant] Reçoit notif → ouvre app → soumet évaluation (5 critères)
                │
    EvaluationCampaign.dueDate atteint (ou clôture manuelle)
                │
    generatePostDeadlineAnalysis()
                │
    AiBalancer.callAI(prompt synthèse) → JSON {summary, recommendation, priority}
                │
    Decision créée automatiquement (status: PROPOSED)
                │
    Notification push admins → "Rapport IA prêt"
```

### Flux 3 : Chat IA Admin (MyIA)

```
Admin tape: "Quels sont les 5 professeurs avec les meilleurs scores ?"
                │
    AiBalancer.callAI(SQL prompt + schéma BDD) → SQL SELECT
                │
    Validation sécurité (SELECT uniquement)
                │
    prisma.$queryRawUnsafe(sql) → rows JSON
                │
    detectChartData(rows) → ChartData (bar/line/pie)
                │
    AiBalancer.callAI(réponse prompt + données) → texte naturel
                │
    Réponse: {"answer": "...", "chart": {...}, "conversationId": "..."}
```

---

## 11. INNOVATION & VALEUR AJOUTÉE

### 11.1 Mode Invité (Guest) — Inclusivité totale
- Un étudiant **sans compte** peut signaler anonymement via l'app mobile ou le portail web
- Identifié par un `UTI` (Unique Tracking Identifier, UUID local) pour le suivi et les notifications
- Le signalement porte `deviceMetadata` pour l'analyse géographique/contextuelle

### 11.2 Fusion d'identité Guest → Étudiant
- Quand l'invité crée un compte, ses signalements passés sont rattachés à son profil
- Continuité d'historique, pas de perte de données

### 11.3 IA Décisionnelle (vs IA purement informative)
- L'IA ne fait pas que "répondre" : elle **génère des décisions PROPOSÉES** automatiquement
- Le circuit : Données → Analyse → Décision proposée → Validation humaine (Admin)
- Chaque décision porte `aiSuggestion` + `rationale` générés par l'IA

### 11.4 Multi-tenant SaaS natif
- Une seule instance backend peut gérer **N écoles** (AFI, ISI, SUPDECO...)
- Chaque école a ses propres paramètres, sa propre IA configurée, son propre slug
- Déploiement d'une nouvelle école en quelques minutes (seed + configuration)

### 11.5 Résilience IA (Multi-Provider Balancer)
- Basculement automatique entre Gemini → Groq → OpenAI → Anthropic
- Cooldown intelligent : 1 min (erreur standard), 5 min (quota dépassé)
- Notification admin automatique lors d'un basculement
- Aucune interruption de service visible par l'utilisateur

---

*Document généré le 13 mai 2026 — Version 1.0 — Hackathon AFI-TECH 2026*
