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

**Local typique** : le **front** (Next.js) tourne sur un port (ex. `http://localhost:3001`) ; l’**API** sur un autre (ex. `http://localhost:3000`). Une URL comme `http://localhost:3001/afi-default-school/login` est une **route Next** : si aucune page n’existe pour ce chemin, Next renvoie **404** — ce n’est pas l’API. Les appels API vont vers `http://localhost:3000/...` (fetch / axios).

## Multi-tenant (School Context)

**Un seul paramètre côté API** : **`TENANT_STRICT_MODE`** (`true` / `false`). Pas de second interrupteur pour le path : il suit automatiquement ce mode.

| `TENANT_STRICT_MODE` | Comportement |
|----------------------|--------------|
| **`true`** (prod) | **Sous-domaine** puis **header `x-school-slug`**. Pas de repli `DEFAULT_SCHOOL_SLUG`. Les URLs **`/<slug>/api/v1`** ne sont **pas montées** sur le serveur : seules **`/api/v1`** et **`/api`** existent. Sans tenant → **404** (école). |
| **`false`** (dev/local) | Même ordre (1)(2), puis si vide : **path `/<slug>/api/...`**, puis **`DEFAULT_SCHOOL_SLUG`** (env, doit exister en `schools.slug`). Le préfixe **`/<slug>/api/v1`** est **activé** côté Express. |

Variable optionnelle **`TENANT_RESOLUTION_MODE`** (`strict` \| `fallback`) : utilisée **uniquement** si `TENANT_STRICT_MODE` est **absent** du `.env` (rétrocompat).

## Prompt / spec pour le front (Next, Vite, etc.)

Copier-coller pour une IA ou une équipe web :

> Tu intègres le front AFI-LISTEN contre l’API sur `PUBLIC_API_URL` (ex. `https://api.example.com` ou `http://localhost:3000`). Base des routes : **`/api/v1`** ou **`/api`** (équivalent).
>
> **Contexte école (obligatoire pour presque tout sauf health/docs)**  
> - En **production** (API avec `TENANT_STRICT_MODE=true`) : soit le **sous-domaine** identifie l’école (`ecole.app.com`), soit chaque requête HTTP vers l’API inclut le header **`x-school-slug: <slug>`** (slug = valeur `schools.slug`, ex. `afi-default-school`).  
> - En **dev** sans sous-domaine, l’API peut accepter aussi les URLs **`/<slug>/api/v1/...`** ou un repli serveur ; côté front, **envoie quand même `x-school-slug`** dès que tu connais l’école (comportement homogène).
>
> **Appels typiques**  
> 1. Au boot : `GET .../system/public` avec le même contexte école → `{ schoolSlug, schoolName, authOtpRequired, ... }`.  
> 2. **Login** : `POST .../auth/login` JSON `{ "email", "password" }` (ou matricule selon contrat). Pas d’OTP sur le login (OTP = inscription seulement si `authOtpRequired`).  
> 3. **Inscription** : `POST .../auth/register` `{ email, password, firstName, lastName }`. Si réponse `step: "REGISTER_OTP_REQUIRED"` → `POST .../auth/register/verify-otp` `{ challengeId, otp }` (6 chiffres). Optionnel : `POST .../auth/register/resend-otp` `{ challengeId }`.  
> 4. **Mot de passe oublié** : `POST .../auth/forgot-password` `{ "email" }` — **toujours** avec contexte école (header ou sous-domaine). Réponse générique 200.  
> 5. **Réinitialisation** : page front `PUBLIC_APP_URL/reset-password?token=...` (lien email). Soumission : `POST .../auth/reset-password` JSON `{ "token", "newPassword", "confirmPassword" }` — en **strict**, l’appel API doit aussi avoir le **même contexte école** que le reste (header `x-school-slug` si pas de sous-domaine) : prévoir le slug côté front (config, ou query `?token=&schoolSlug=` si tu l’ajoutes au routeur).  
> 6. **Authentifié** : header `Authorization: Bearer <accessToken>` + `x-school-slug` si besoin.
>
> **Next.js** : les routes `localhost:3001/mon-slug/login` sont des **pages Next**, pas l’API ; les `fetch` vont vers le **port API** avec les headers ci-dessus.

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

Pour les routes métiers, ajouter aussi (fallback dev/tests) :

`x-school-slug: <slug-ecole>`

**Ordre de résolution tenant** : sous-domaine → `x-school-slug` → (non strict seulement) path `/<slug>/api/...` puis `DEFAULT_SCHOOL_SLUG`. Un **`x-school-slug` valide** prime sur un `DEFAULT_SCHOOL_SLUG` erroné côté serveur.

`GET /api/v1/system/public` renvoie les toggles **de l’école détectée** (`schoolSlug` + `schoolName` cohérents avec cette école), pas des valeurs génériques.

### Login (2 étapes — OTP email)

`POST /api/v1/auth/login` avec `email` ou `matricule` + `password`  
- Réponse : **toujours** `token` + `refreshToken` + `user`.

> Important: l’OTP **ne s’applique pas au login**. Il s’applique uniquement au **premier register** (voir section suivante).

### Register (OTP conditionnel — 1ère inscription)

Flux recommandé (Front):

1. **Lire les toggles publics**  
   `GET /api/v1/system/public` (ou `/api/system/public`)  
   - même contexte école (sous-domaine ou `x-school-slug`)
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

**Cycle de vie (backend)** : avec OTP requis, le compte est créé tout de suite (`emailVerified=false`) ; le **login mot de passe est refusé** tant que l’email n’est pas vérifié via `verify-otp`. Les comptes élèves **STUDENT** non vérifiés au-delà de `PENDING_REGISTRATION_TTL_MINUTES` (défaut 30) sans refresh token sont **supprimés automatiquement** (job périodique), ainsi que les comptes désactivés après trop de tentatives OTP.

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
- `POST /api/school-users/:id/reset-password-default` — réinitialise le mot de passe vers `DEFAULT_PASSWORD_RESET` (env serveur), révoque refresh / tokens reset & OTP.

### Réponses `school-users` (listes & détail)

Champs utiles pour le front (en plus de l’identité) :

- `campusAccess` : `"ALL"` si `campusId` est `null` (périmètre toute l’école), sinon `"RESTRICTED"`.
- `campusScopeLabel` : `"TOUS"` ou `null` (libellé UI).
- `avatarUrl` : URL signée de la photo de profil du **User**, ou `null` si aucune image.

## Profil utilisateur, identité & avatars (référence front)

Cette section décrit les **formes JSON** renvoyées après les changements récents (profil étendu + photos).

### Objet `user` (login, register, verify-otp, `GET/PATCH /me`, upload avatar)

| Champ | Type | Notes |
|--------|------|--------|
| `id` | string (uuid) | |
| `email`, `firstName`, `lastName` | string | |
| `role` | enum | `SUPERADMIN` … `STUDENT` |
| `isActive`, `emailVerified` | boolean | |
| `matricule`, `numero`, `phone` | string \| null | Optionnels ; identité / contact |
| `campusId`, `classId`, `schoolId` | string \| null | Selon rôle / affectation |
| **`avatarUrl`** | **string \| null** | **URL signée** (bucket Supabase `attachments`). **Expire** après `SIGNED_URL_EXPIRES_IN` secondes (env API). Rafraîchir via `GET /api/.../auth/me` ou réafficher après navigation. |
| `createdAt`, `updatedAt` | ISO date-time | |

Le serveur ne renvoie **pas** le chemin brut `avatarPath` dans ces objets “safe” ; seulement `avatarUrl` lorsqu’une photo existe.

### `PATCH /api/.../auth/me`

Body JSON (tous optionnels) : `firstName`, `lastName`, `matricule`, `numero`, `phone`  
(chaînes vides traitées comme suppression pour les champs nullable).

### Photo de profil **compte** (tous rôles avec JWT)

| Méthode | Path | Body |
|---------|------|------|
| `POST` | `/api/auth/me/avatar` | `multipart/form-data`, champ fichier : **`file`** — JPEG, PNG ou WebP (max ~5 Mo selon config). |
| `DELETE` | `/api/auth/me/avatar` | — |

Réponse : même enveloppe standard ; `data` = objet `user` avec `avatarUrl` à jour.

### Professeurs (`/api/professors`)

Les réponses **liste** et **détail** enrichissent chaque fiche avec :

| Champ | Description |
|--------|--------------|
| `campusAccess` | `ALL` si aucun campus assigné (toute l’école), sinon `RESTRICTED`. |
| `campusScopeLabel` | `"TOUS"` ou `null`. |
| **`avatarUrl`** | URL signée ou `null`. Priorité d’affichage : si un **User** est lié (`userId`), la photo vient du **compte User** ; sinon de la fiche **Professor**. |
| **`linkedUserId`** | `string \| null` — id du compte utilisateur lié, si présent. |

**Upload / suppression photo fiche prof**

| Méthode | Path | Qui peut |
|---------|------|----------|
| `POST` | `/api/professors/:id/avatar` | `multipart/form-data`, champ **`file`**. **ADMIN**, **MANAGER**, ou l’enseignant dont le `userId` du prof = l’utilisateur connecté. |
| `DELETE` | `/api/professors/:id/avatar` | Mêmes règles. |

Si le prof a un `userId`, l’upload est stocké sur le **User** (photo unique compte + fiche).

### Upload générique (pièces jointes)

`POST /api/uploads` reste disponible pour d’autres fichiers ; les **avatars** peuvent aussi passer par les routes dédiées ci-dessus (validation image stricte).

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

