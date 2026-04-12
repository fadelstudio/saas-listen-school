# 📋 AFI-LISTEN BACKEND — PÉRIMÈTRE & FONCTIONNALITÉS
> **Version :** 1.0 | **Date :** 2026-04-11  
> **Périmètre :** Ce document décrit UNIQUEMENT ce que gère le backend Node.js

---

## 1. RÔLE DU BACKEND

Le backend est le **cœur logique central** de la plateforme AFI-LISTEN.  
Il est **le seul point de vérité** pour la logique métier, la sécurité, la validation et l'orchestration.

Il ne sait **pas** afficher des interfaces. Il expose uniquement des **API REST JSON**.

```
Mobile Flutter  ─────┐
Site web Next.js ────┼──► Backend API REST ──► Supabase (PostgreSQL)
Dashboard Next.js ───┘         │
                               └──► BullMQ / Redis ──► IA (Gemini / Groq)
```

---

## 2. MODULES GÉRÉS

### MODULE 1 — AUTH (`/api/auth`)

**Rôle :** Gérer l'identité, la session et les accès.

| Fonctionnalité | Endpoint | Méthode |
|---|---|---|
| Inscription utilisateur | `/api/auth/register` | POST |
| Connexion (login) | `/api/auth/login` | POST |
| Déconnexion (invalidation token) | `/api/auth/logout` | POST |
| Récupérer profil courant | `/api/auth/me` | GET |
| Mettre à jour son profil | `/api/auth/me` | PATCH |
| Changer son mot de passe | `/api/auth/change-password` | POST |
| Rafraîchir le token | `/api/auth/refresh` | POST |

**Règles métier :**
- Mot de passe hashé avec bcrypt (saltRounds ≥ 12)
- Token JWT valide 7 jours
- Rôles : `ADMIN`, `MANAGER`, `AGENT`, `VIEWER`
- Un `ADMIN` peut activer/désactiver un utilisateur
- Authentification conditionnelle : le backend peut accepter les soumissions anonymes si configuré (par defaut anonyme)

---

### MODULE 2 — REPORTS (`/api/reports`)

**Rôle :** Recevoir, stocker et gérer les signalements des étudiants.

| Fonctionnalité | Endpoint | Méthode | Auth |
|---|---|---|---|
| Créer un signalement | `/api/reports` | POST | Optionnel |
| Lister tous les signalements | `/api/reports` | GET | Oui |
| Récupérer un signalement | `/api/reports/:id` | GET | Oui |
| Mettre à jour un signalement | `/api/reports/:id` | PATCH | Oui |
| Supprimer un signalement | `/api/reports/:id` | DELETE | ADMIN |
| Changer le statut | `/api/reports/:id/status` | PATCH | MANAGER+ |
| Déclencher l'analyse IA | `/api/reports/:id/analyze` | POST | MANAGER+ |
| Pagination + filtres | `/api/reports?status=&page=&limit=` | GET | Oui |

**Champs d'un signalement :**
- `title` — titre court
- `content` — description complète
- `type` — `PROBLEM_MATERIAL` | `PROBLEM_ADMIN` | `PROBLEM_PEDAGOGICAL` | `INCIDENT` | `OTHER`
- `category` — catégorie libre ou prédéfinie
- `priority` — `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`
- `isAnonymous` — booléen
- `status` — `DRAFT` → `SUBMITTED` → `REVIEWED` → `APPROVED` | `REJECTED`
- `aiAnalysis` — résultat de l'analyse IA (rempli après job)

**Règles métier :**
- Un signalement anonyme ne stocke pas `authorId`
- Seul `ADMIN/MANAGER` peut changer le statut
- L'analyse IA est déclenchée manuellement ou automatiquement selon config
- Pagination obligatoire (défaut : page=1, limit=20)

---

### MODULE 3 — EVALUATIONS (`/api/evaluations`)

**Rôle :** Recevoir et gérer les évaluations de cours et de professeurs.

| Fonctionnalité | Endpoint | Méthode | Auth |
|---|---|---|---|
| Créer une évaluation | `/api/evaluations` | POST | Optionnel |
| Lister les évaluations | `/api/evaluations` | GET | Oui |
| Récupérer une évaluation | `/api/evaluations/:id` | GET | Oui |
| Mettre à jour une évaluation | `/api/evaluations/:id` | PATCH | Oui |
| Supprimer une évaluation | `/api/evaluations/:id` | DELETE | ADMIN |
| Statistiques agrégées | `/api/evaluations/stats` | GET | MANAGER+ |
| Déclencher l'analyse IA | `/api/evaluations/:id/analyze` | POST | MANAGER+ |
| Filtres | `/api/evaluations?reportId=&status=&page=` | GET | Oui |

**Champs d'une évaluation :**
- `reportId` — lien vers un signalement (optionnel)
- `evaluatorId` — évaluateur (peut être anonyme)
- `score` — note globale (0-20)
- `clarityScore` — clarté du cours (0-5)
- `pedagogyScore` — pédagogie (0-5)
- `availabilityScore` — disponibilité (0-5)
- `rhythmScore` — rythme (0-5)
- `comment` — commentaire libre
- `isAnonymous` — booléen
- `status` — `PENDING` | `IN_PROGRESS` | `COMPLETED`
- `aiScore` — score calculé par IA

**Statistiques agrégées retournées :**
- Moyenne par module
- Moyenne par professeur
- Distribution des scores
- Tendances sur la période

---

### MODULE 4 — AI (`/api/ai`)

**Rôle :** Interface de contrôle des traitements IA asynchrones.

| Fonctionnalité | Endpoint | Méthode | Auth |
|---|---|---|---|
| Statut d'un job IA | `/api/ai/jobs/:jobId` | GET | Oui |
| Lister les jobs IA | `/api/ai/jobs` | GET | MANAGER+ |
| Résultat d'un job IA | `/api/ai/jobs/:jobId/result` | GET | Oui |
| Relancer un job échoué | `/api/ai/jobs/:jobId/retry` | POST | ADMIN |
| Chat IA sur les données | `/api/ai/chat` | POST | MANAGER+ |
| Générer synthèse globale | `/api/ai/synthesis` | POST | MANAGER+ |

**Format sortie standard IA :**
```json
{
  "sentiment": "negative | neutral | positive",
  "category": "string",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "summary": "string (résumé court)",
  "recommendation": "string (action recommandée)",
  "confidence": 0.0,
  "processedAt": "ISO 8601"
}
```

**Types de jobs IA :**
- `report-analysis` — Analyse d'un signalement
- `evaluation-scoring` — Scoring IA d'une évaluation
- `decision-suggestion` — Suggestion de décision
- `global-synthesis` — Synthèse périodique de tous les retours
- `chat-query` — Réponse à une question en langage naturel

**Règles :**
- Tous les appels IA sont **asynchrones** via BullMQ
- Les jobs ont un statut : `QUEUED` → `PROCESSING` → `DONE` | `FAILED`
- Retry automatique sur échec (max 3 tentatives)
- Le résultat est stocké dans `AiJob.result` en JSON

---

### MODULE 5 — DECISIONS (`/api/decisions`)

**Rôle :** Gérer les décisions prises suite aux analyses des signalements.

| Fonctionnalité | Endpoint | Méthode | Auth |
|---|---|---|---|
| Créer une décision | `/api/decisions` | POST | MANAGER+ |
| Lister les décisions | `/api/decisions` | GET | Oui |
| Récupérer une décision | `/api/decisions/:id` | GET | Oui |
| Mettre à jour une décision | `/api/decisions/:id` | PATCH | MANAGER+ |
| Supprimer une décision | `/api/decisions/:id` | DELETE | ADMIN |
| Changer le statut | `/api/decisions/:id/status` | PATCH | MANAGER+ |
| Filtres | `/api/decisions?status=&page=` | GET | Oui |

**Champs d'une décision :**
- `evaluationId` — source de la décision
- `deciderId` — utilisateur qui prend la décision
- `title` — titre de l'action décidée
- `rationale` — justification
- `priority` — `LOW` | `MEDIUM` | `HIGH`
- `responsible` — responsable de l'exécution
- `dueDate` — échéance
- `status` — `PENDING` | `APPROVED` | `REJECTED` | `DEFERRED` | `DONE`
- `aiSuggestion` — suggestion IA (générée automatiquement)

---

## 3. FONCTIONNALITÉS TRANSVERSALES

### 3.1 Gestion des rôles

| Rôle | Description | Permissions |
|---|---|---|
| `ADMIN` | Administrateur système | Tout |
| `MANAGER` | Responsable pédagogique | Lire/modifier tout, décisions, analyses |
| `AGENT` | Enseignant / coordinateur | Soumettre, voir ses propres données |
| `VIEWER` | Lecteur seul | Consultation uniquement |

### 3.2 Pagination standardisée

Tous les endpoints de liste acceptent :
```
GET /api/reports?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

Toutes les réponses de liste retournent :
```json
{
  "success": true,
  "message": "Reports fetched",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0
  },
  "error": null
}
```

### 3.3 Filtres avancés

| Paramètre | Type | Applicable sur |
|---|---|---|
| `status` | enum | Reports, Evaluations, Decisions, AI Jobs |
| `authorId` | uuid | Reports |
| `evaluatorId` | uuid | Evaluations |
| `startDate` | ISO date | Tous |
| `endDate` | ISO date | Tous |
| `isAnonymous` | boolean | Reports, Evaluations |
| `priority` | enum | Reports, Decisions |

### 3.4 Health Check

```
GET /health
→ 200 { success: true, message: "Server is healthy", data: null, error: null }
```

### 3.5 Gestion des fichiers joints

- Upload vers Supabase Storage (bucket `attachments`)
- Endpoint : `POST /api/uploads` (multipart/form-data)
- Retourne une URL sécurisée signée (expiry configurable)
- Types acceptés : images, audio, PDF
- Taille max : configurable via env

### 3.6 Logging & Audit

- Toutes les actions importantes sont loggées via le logger utility
- Actions tracables : login, logout, création/suppression d'entités, changements de statut
- Logs structurés (JSON) pour parsing facile

### 3.7 Authentification conditionnelle

- `ALLOW_ANONYMOUS_SUBMISSIONS` — variable env booléenne
- Si `true` : les routes `POST /api/reports` et `POST /api/evaluations` n'exigent pas de token
- Si `false` : toutes les routes sont protégées

---

## 4. CE QUE LE BACKEND NE GÈRE PAS

| Hors périmètre | Géré par |
|---|---|
| Interface mobile | Flutter App |
| Interface web publique | Next.js (site signalement) |
| Dashboard visuel | Next.js (dashboard) |
| Transcription vocale directe | IA via job BullMQ |
| Envoi d'emails | (futur) Service d'email externe |
| Notifications push | (futur) Firebase / OneSignal |
| Auth sociale (Google, etc.) | (futur) Supabase Auth |

---

## 5. CONTRAINTES DE PERFORMANCE

| Contrainte | Valeur |
|---|---|
| Temps de réponse API (hors IA) | < 500 ms |
| Traitement IA | Asynchrone (non bloquant) |
| Pagination | Obligatoire sur tous les lists |
| Taille max payload JSON | 10 MB |
| Rate limiting | À implémenter (express-rate-limit) |

---

## 6. VARIABLES D'ENVIRONNEMENT COMPLÈTES

| Variable | Requis | Description |
|---|---|---|
| `PORT` | ✅ | Port HTTP du serveur |
| `DATABASE_URL` | ✅ | URL PostgreSQL Supabase |
| `JWT_SECRET` | ✅ | Clé secrète JWT |
| `SUPABASE_URL` | ⚠️ | URL projet Supabase (Storage) |
| `SUPABASE_KEY` | ⚠️ | Clé service Supabase |
| `REDIS_HOST` | ✅ | Hôte Redis pour BullMQ |
| `REDIS_PORT` | ✅ | Port Redis |
| `GEMINI_API_KEY` | ✅ | Clé API Gemini |
| `GROQ_API_KEY` | ⚠️ | Clé API Groq (fallback IA) |
| `NODE_ENV` | ✅ | `development` \| `production` |
| `ALLOW_ANONYMOUS_SUBMISSIONS` | ⚠️ | `true` \| `false` |
| `MAX_FILE_SIZE_MB` | ⚠️ | Taille max upload (défaut: 10) |
