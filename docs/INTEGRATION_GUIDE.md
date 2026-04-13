# AFI-LISTEN — Guide d’intégration (Front/Web + Back)

Ce document sert de référence “pratique” pour intégrer le front avec l’API et éviter les erreurs (validation, auth, flows).

## Base URLs

Deux préfixes existent (compatibilité) :

- **Recommandé**: `/api`
- **Alias**: `/api/v1`

Exemples (prod Render) :

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

### Login

- `POST /api/v1/auth/login` → retourne `token` + `refreshToken`

### Refresh

- `POST /api/v1/auth/refresh` avec `refreshToken`

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

- UUID invalide (ex: `classId`, `moduleId`, `professorId`)
- champs `title/content` trop courts
- `dueDate` non ISO (doit être `date-time` valide)

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

