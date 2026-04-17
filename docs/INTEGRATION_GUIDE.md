# AFI-LISTEN — Guide d’intégration (Front/Web + Back)

Ce document sert de référence “pratique” pour intégrer le front avec l’API et éviter les erreurs (validation, auth, flows).

## Base URLs

Deux préfixes existent (compatibilité) :

- **Recommandé**: `/api`
- **Alias**: `/api/v1`

Exemples (prod Railway) :

- Health: `/health`
- Swagger: `/api-docs`
- API v1 info: `/api/v1`

## Format de réponse (standard)

Toutes les routes retournent :

```json
{
  "success": true,
  "message": "string",
  "data": {},
  "error": null,
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

- `meta` est **optionnel** (listes paginées).

## Auth (JWT)

### Header

`Authorization: Bearer <token>`

### Login (2 étapes — OTP email)

`POST /api/v1/auth/login` avec `email` ou `matricule` + `password`  
- Réponse : **toujours** `token` + `refreshToken` + `user`.

> Important: l’OTP **ne s’applique pas au login**. Il s’applique uniquement au **premier register** (voir section suivante).

### Register (OTP conditionnel — 1ère inscription)

Flux recommandé (Front):

1. **Lire les toggles publics**  
   `GET /api/v1/system/public` (ou `/api/system/public`)  
   - Champs utiles: `authOtpRequired`, `authReportsRequired`, `authEvaluationsRequired`
2. **Créer le compte**  
   `POST /api/v1/auth/register`
   - Si `authOtpRequired=false` → réponse **login normale**: `{ token, refreshToken, user }`
   - Si `authOtpRequired=true` → réponse: `{ step: "REGISTER_OTP_REQUIRED", challengeId, expiresInSeconds }` (pas de token)
3. **Valider l’OTP d’inscription** (si requis)  
   `POST /api/v1/auth/register/verify-otp` avec `{ challengeId, otp }`  
   - Réponse : **login normale** `{ token, refreshToken, user }`
4. (optionnel) **Renvoyer l’OTP**  
   `POST /api/v1/auth/register/resend-otp` avec `{ challengeId }`

### Reset mot de passe

- `POST /api/v1/auth/forgot-password` `{ "email": "..." }` — réponse générique (pas d’énumération).
- `POST /api/v1/auth/reset-password` `{ token, newPassword, confirmPassword }` — révoque les refresh tokens existants.

### Refresh

- `POST /api/v1/auth/refresh` avec `refreshToken`

## Utilisateurs école (ADMIN campus)

- `POST /api/school-users` — crée `MANAGER` | `AGENT` | `VIEWER` | `STUDENT`.
- `GET /api/school-users/staff` — **Nouveau**: Liste uniquement le personnel (MANAGER+). Filtrable par `campusId`, `search`, `role`.
- `GET /api/school-users/students` — **Nouveau**: Liste uniquement les étudiants. Filtrable par `campusId`, `classId`, `search`, `isActive`.
- `GET /api/school-users` — Liste brute (legacy/tous). Supporte désormais les mêmes filtres avancés.
- `PATCH /api/school-users/:id` — modifier rôle / `isActive` / `classId`.

## Endpoints de Liaison (Navigation Dashboard)

Ces endpoints permettent une navigation fluide sans charger tous les utilisateurs.

- `GET /api/campuses/:id/classes` — Toutes les classes d'un campus.
- `GET /api/campuses/:id/students` — Tous les étudiants d'un campus (format simplifié).
- `GET /api/campuses/:id/professors` — Tous les profs d'un campus.
- `GET /api/campuses/:id/stats` — Compteurs (classes, students, professors).
- `GET /api/classes/:id/students` — Liste des élèves d'une classe spécifique.

## Évaluations (critères enum + note /20)

Chaque évaluation doit envoyer **cinq** champs `RatingBand` :

`VERY_POOR` | `POOR` | `FAIR` | `GOOD` | `EXCELLENT`

- `comprehensionRating` — compréhension du cours
- `explanationRating` — qualité des explications du professeur  
- `pedagogyRating`, `availabilityRating`, `rhythmRating`

La note `score` (0–20) est **calculée côté API** : moyenne des 5 niveaux (1–5) × 4.

## RBAC (rôles)

- `SUPERADMIN` : SaaS (créer école + premier admin)
- `ADMIN` : full access sur l’école
- `MANAGER` : gestion académique / traitement
- `AGENT` : opérationnel
- `VIEWER` : lecture seule
- `STUDENT` : soumissions (selon settings)

## Validations (Zod) — erreurs fréquentes

En cas d’entrée invalide → **422** avec `error` structuré.

Exemples typiques :

- ID invalide (ex: `classId`, `moduleId`, `professorId`)  
  > Note: selon les environnements/seed, certains IDs peuvent être des strings “lisibles” (ex: `class-l3-info`) et pas forcément des UUID. L’API accepte ces formats tant qu’ils matchent le format d’ID attendu (alphanum + `_`/`-`).
- champs `title/content` trop courts
- `dueDate` non ISO (doit être `date-time` valide)

## Tests API (Postman/Newman) — note OTP

L’OTP étant **uniquement sur /register**, les collections centrées sur le staff/admin (login) ne sont pas impactées.

Pour tester l’OTP en dev:
- `MAIL_PROVIDER=console` pour logger le code
- Variables utiles d’email OTP: `EMAIL_FROM`, `OTP_SITE_NAME`, `OTP_EMAIL_SUBJECT`, `OTP_HELP_URL`

## Pagination (listes)

Les endpoints de listes supportent généralement :

- `?page=1&limit=20`

La réponse retourne `meta` (page/limit/total/totalPages).

## Flow “optimal” — Campagne d’évaluation + notifications + rappels

### Objectif

Un ADMIN crée une **demande d’évaluation** (= `EvaluationCampaign`) ciblée.
Les étudiants concernés reçoivent une notif et voient une évaluation “en attente”.

### 1) Création campagne (ADMIN)

`POST /api/v1/evaluation-campaigns`

Champs principaux :

- `title`
- `moduleId`
- `professorId`
- `dueDate` (**obligatoire** : deadline / date de fin)
- `scope` : `CLASS | CAMPUS | SCHOOL`
- `classId` requis si `scope=CLASS`
- `campusId` requis si `scope=CAMPUS`

### 2) Notifications automatiques (max 2 / étudiant)

Pour chaque étudiant ciblé :

1) **à la création** : `EVALUATION_CAMPAIGN`
2) **rappel 2–3 jours avant la deadline** si pas encore fait : `EVALUATION_CAMPAIGN_REMINDER`

Anti-spam garanti en DB par une contrainte `UNIQUE(userId, campaignId, type)`.

### 3) Côté front: “évaluations en attente”

Le front peut afficher “en attente” en comparant :

- campagnes `ACTIVE` ciblant l’étudiant
- vs évaluations existantes avec `campaignId` et `evaluatorId`

> Recommandation: calculer “pending” à la volée (scalable), plutôt que créer des lignes “PENDING” en masse.

### 4) Soumission d’une évaluation (STUDENT / Anonymous selon settings)

`POST /api/v1/evaluations`

Champs importants :

- `professorId`, `moduleId`, `classId`
- `score`, `comment`, `isAnonymous`
- **si ça vient d’une campagne**: envoyer `campaignId`

> Pour un suivi parfait, l’API doit lier `evaluatorId` via le token (pas via le body).

## Notifications (lecture)

### Lire mes notifications

`GET /api/v1/notifications`

Filtres :

- `page`, `limit`
- `isRead=true|false`
- `type=AI_FAILURE|EVALUATION_CAMPAIGN|EVALUATION_CAMPAIGN_REMINDER|SYSTEM`

### Marquer comme lu

`PATCH /api/v1/notifications/:id/read`

Sécurité :

- on ne peut marquer “lu” que ses notifications (ou globales).

## Uploads

`POST /api/v1/uploads` (multipart/form-data)

- `file` (obligatoire)
- bucket Supabase: `attachments` (privé)
- retour: URL signée (temporaire)

## IA / Jobs

L’IA est asynchrone via BullMQ (Redis) et un worker.

Routes utiles :

- `POST /api/v1/reports/:id/analyze`
- `POST /api/v1/evaluations/:id/analyze`
- `POST /api/v1/ai/chat`
- `POST /api/v1/ai/synthesis`
- `GET /api/v1/ai/jobs` / `GET /api/v1/ai/jobs/:id/result`

## Codes HTTP (rappel)

- `200/201` succès
- `400` bad request
- `401` non authentifié
- `403` authentifié mais interdit
- `404` introuvable
- `422` validation Zod
- `500` erreur serveur

## Environnements (prod)

Variables minimales (Render API + Worker Railway + Redis Upstash) :

- `NODE_ENV=production`
- `DATABASE_URL` (Supabase)
- `REDIS_URL` (Upstash `rediss://...`)
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `JWT_SECRET`
- `GEMINI_API_KEY` / `GROQ_API_KEY` (selon usage)

