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

- `MAX_FILE_SIZE_MB`
- `SIGNED_URL_EXPIRES_IN`

### Démarrage / migrations

- L’API lance automatiquement `prisma migrate deploy` au démarrage (`npm run render:start:api`)
- Le worker ne lance pas de migrations (`npm run start:worker`)
