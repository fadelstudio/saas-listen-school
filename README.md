# saas-listen-school (AFI-LISTEN Backend)

Backend API REST (Express 5 + TypeScript strict) pour AFI-LISTEN.

## Démarrage rapide

```bash
npm install
npm run dev
```

- API: `http://localhost:3000/api`
- API (alias): `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api-docs`
- Health: `GET http://localhost:3000/health`
- **Intégration front (profils, avatars, tenant, JSON)** : voir [`docs/INTEGRATION_GUIDE.md`](docs/INTEGRATION_GUIDE.md) ; référence endpoints : [`docs/api.md`](docs/api.md)

## Environnement local “comme Render” (API + Worker + Redis)

Pré-requis:

- Docker Desktop (pour Redis)
- Vérifier que `docker` fonctionne dans un terminal (`docker --version`)

Démarrer tout en 1 commande:

```bash
npm run dev:all
```

Pour arrêter **API + Worker + Redis** (arrêt propre), fais `CTRL+C` dans le terminal qui exécute `dev:all`.
Ensuite tu peux aussi nettoyer les conteneurs réseau:

```bash
npm run dev:stop
```

### Dépannage Docker (Windows)

Si tu vois l’erreur `docker-credential-desktop ... not found in %PATH%` pendant `npm run dev:redis`:

- Ferme/réouvre le terminal après l’installation de Docker Desktop
- Redémarre Docker Desktop (ou le PC si besoin)
- Vérifie que ce binaire est accessible:

```bash
docker-credential-desktop --version
```

Sinon, ajoute `C:\Program Files\Docker\Docker\resources\bin` au **PATH** Windows (puis réouvre le terminal) ou réinstalle Docker Desktop.

Stop Redis (et libérer le port):

```bash
npm run dev:stop
```

## Scripts

```bash
npm run dev
npm run dev:api
npm run dev:worker
npm run dev:redis
npm run dev:all
npm run dev:stop
npm run build
npm start
```

## Variables d’environnement (extrait)

Créer un fichier `.env`:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://...
JWT_SECRET=change_me_very_long_secret

# Connexion Google (Sign-In) — optionnel. Liste d’OAuth 2.0 Client IDs (champ `aud` du id_token),
# séparés par des virgules (ex. client Web + client Android). Sans cette variable, POST /api/auth/google renvoie une erreur explicite.
# Obtenir les IDs : Google Cloud Console → APIs & Services → Credentials → ID client OAuth (type « Application Web » ou « Android » / « iOS »).
GOOGLE_OAUTH_CLIENT_IDS=123456789-xxxx.apps.googleusercontent.com

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=xxxxx

REDIS_HOST=localhost
REDIS_PORT=6379

GEMINI_API_KEY=xxxxx
GROQ_API_KEY=xxxxx

# Uploads
MAX_FILE_SIZE_MB=10
SIGNED_URL_EXPIRES_IN=3600

# Redis (LOCAL)
REDIS_HOST=localhost
REDIS_PORT=6379

# Redis (PRODUCTION)
# REDIS_URL=redis://...
```

## Uploads (pièces jointes)

- Endpoint: `POST /api/uploads` (multipart/form-data)
- Bucket Supabase: `attachments` (privé)
- Réponse: retourne une **URL signée** (temporaire) + metadata fichier.

## Tests API (Postman/Newman)

```bash
newman run AFI_LISTEN_GOD_MODE.postman_collection.json --delay-request 500
```

## Guides développeurs

- Guide intégration Front/Back: `docs/INTEGRATION_GUIDE.md`
- **Nouvelles fonctionnalités (Annonces & Pièces Jointes)** : `docs/NEW_FEATURES_GUIDE.md`
- **Spécifique Mobile (Flutter)** : `docs/MOBILE_INTEGRATION_GUIDE.md`
- **Perspectives & Évolution IA (RAG & IA Dédiée)** : `docs/AI_PERSPECTIVES.md`
- **Auth Google (REST, Web / APK / iOS, variables d’environnement)** : `docs/GOOGLE_AUTH_REST.md`
- Import Postman (collection + env): `postman/IMPORT_GUIDE.md`

## Déploiement Render (API + Worker + Redis)

Le repo contient un blueprint `render.yaml` qui crée **2 services**:

- **Web Service**: `afi-listen-api` (Express)
- **Worker Service**: `afi-listen-worker` (BullMQ processor)

Redis est fourni par Render (ou externe) et injecté via `REDIS_URL`.

### Variables Render à configurer (Secrets)

- `DATABASE_URL` (Supabase PostgreSQL)
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `REDIS_URL` (Render Redis). Format attendu en général:
  - `redis://:PASSWORD@HOST:6379` (ou `rediss://...` si TLS est imposé)
- `GEMINI_API_KEY` / `GROQ_API_KEY` (selon usage)

Optionnel:

- `GOOGLE_OAUTH_CLIENT_IDS` (connexion Google — **API uniquement** ; voir extrait `.env` plus haut)
- `MAX_FILE_SIZE_MB`
- `SIGNED_URL_EXPIRES_IN`

### Démarrage / migrations

- L’API lance automatiquement `prisma migrate deploy` au démarrage (`npm run render:start:api`)
- Le worker ne lance pas de migrations (`npm run start:worker`)

## Déploiement actuel (FREE) — Render (API) + Upstash (Redis) + Railway (Worker)

Objectif: avoir un environnement “prod-like” **sans budget**, avec **API + queue + worker**.

### Architecture

- **API**: Render (Web Service)
- **Redis**: Upstash (Redis managé, TLS `rediss://...`)
- **Worker**: Railway (service long-running qui consomme BullMQ)
- **DB**: Supabase Postgres (`DATABASE_URL`)

### Pourquoi Upstash (au lieu de Render Redis)

- Le Redis Render (Key Value / Valkey) est souvent **lié au réseau privé Render** et/ou impose une **whitelist IP** pour l’accès externe.
- Upstash fournit une URL publique **TLS** (`rediss://...`) utilisable depuis Render *et* Railway sans config réseau fragile.

### Variables d’environnement (prod)

À définir **sur Render (API)** et **sur Railway (Worker)**:

- `NODE_ENV=production`
- `DATABASE_URL` (Supabase)
- `REDIS_URL` (**Upstash**, format: `rediss://default:<password>@<host>:6379`)
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GEMINI_API_KEY` / `GROQ_API_KEY` (selon usage)

Optionnel:

- `GOOGLE_OAUTH_CLIENT_IDS` (Render **API** seulement, si Sign-In Google côté clients)
- `MAX_FILE_SIZE_MB`
- `SIGNED_URL_EXPIRES_IN`

### Start commands

- **API (Render)**:
  - Build: `npm ci && npm run render:build`
  - Start: `npm run render:start:api` (inclut `prisma migrate deploy`)

- **Worker (Railway)**:
  - Build: `npm ci && npm run render:build`
  - Start: `npm run start:worker`

### Vérifier que tout communique

1. API up:
   - `GET https://<ton-domaine>/health`
2. Redis OK:
   - Logs API + Worker doivent montrer `Redis connected` (pas de boucle “reconnecting”)
3. End-to-end:
   - Déclenche un endpoint qui enqueue un job IA (ex: `POST /api/v1/reports/:id/analyze`)
   - Vérifie dans les logs Worker que le job est consommé.

### Notifications automatiques (max 2 / étudiant)

Pour une campagne d’évaluation:

1) **Notification immédiate** à la création de campagne (type `EVALUATION_CAMPAIGN`)
2) **Rappel 2–3 jours avant la deadline** si l’étudiant n’a pas encore soumis d’évaluation pour cette campagne (type `EVALUATION_CAMPAIGN_REMINDER`)

Le rappel est exécuté par le worker (Railway) via une boucle horaire.
Une contrainte DB empêche les doublons: `UNIQUE(userId, campaignId, type)`.

### Monitoring (quoi regarder)

- **Render logs (API)**: erreurs 5xx, latence, “Redis reconnecting…”, erreurs Prisma.
- **Railway logs (Worker)**: crashes/restarts, erreurs IA (Gemini/Groq), “Redis reconnecting…”.
- **Upstash dashboard**: quotas free, connexions, ops/sec, mémoire.
- **Supabase**: erreurs DB, connexions, perf.

## Postman — Collections (importables)

Ce repo contient une collection complète “tout les endpoints, sans exemption”:

- `AFI_LISTEN_ALL_ENDPOINTS.postman_collection.json`

Et une version prête pour la prod (baseUrl = Render), + un environment:

- `postman/AFI_LISTEN_PROD.postman_environment.json`

### Import / exécution

1) Postman → Import → sélectionne la collection + l’environment.  
2) Choisis l’environment `AFI_LISTEN (PROD)`  
3) Clique “Run” (Collection Runner) pour exécuter le scénario complet.
