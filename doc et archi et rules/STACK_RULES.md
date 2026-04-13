# 🏗️ AFI-LISTEN BACKEND — STACK & SCHEMA RULES
> **Version :** 1.0 | **Date :** 2026-04-11  
> **Statut :** 🔒 VERROUILLÉ — Toute déviation est interdite sans vote d'équipe.

---

## 1. STACK TECHNOLOGIQUE (LOCKED)

| Couche | Technologie | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | ≥ 18 LTS | |
| Langage | TypeScript | strict | NO `any`, NO hacks |
| Framework | Express.js | v5 | |
| ORM | Prisma + @prisma/client | latest | NO raw SQL sauf migrations |
| Validation | Zod | latest | OBLIGATOIRE sur tout input |
| Auth | jsonwebtoken + bcrypt | latest | JWT Bearer |
| Queue | BullMQ + ioredis | latest | IA async UNIQUEMENT |
| Base de données | PostgreSQL via Supabase | — | `DATABASE_URL` dans `.env` |
| IA Primaire | Gemini API | — | Uniquement dans `src/jobs/` |
| IA Secondaire | Groq API | — | Seulement dans `src/jobs/` |
| Utils | uuid, dayjs | latest | |

---

## 2. ARCHITECTURE DOSSIERS (IMMUABLE)

```
src/
 ├── modules/
 │    ├── auth/            → controller, service, repository, schema, route, types
 │    ├── reports/         → controller, service, repository, schema, route, types
 │    ├── evaluations/     → controller, service, repository, schema, route, types
 │    ├── ai/              → controller, service, repository, schema, route, types
 │    ├── decisions/       → controller, service, repository, schema, route, types
 │
 ├── core/
 │    ├── config/
 │    │    ├── env.ts       → Zod-validated env loader (SEUL accès à process.env)
 │    │    └── queue.ts     → BullMQ queue factory + constantes
 │    ├── database/
 │    │    └── prisma.ts    → Singleton PrismaClient
 │    ├── middleware/
 │    │    ├── auth.middleware.ts     → JWT verify → req.user
 │    │    ├── error.middleware.ts    → Global error handler
 │    │    └── validate.middleware.ts → Zod validation body/params/query
 │    ├── errors/
 │    │    ├── AppError.ts           → Classe de base erreur
 │    │    └── HttpException.ts      → HTTP errors typées
 │
 ├── jobs/
 │    └── ai.processor.ts   → BullMQ Worker — SEUL endroit pour appels IA
 │
 ├── utils/
 │    ├── response.ts        → sendSuccess() / sendError()
 │    └── logger.ts          → Logger structuré (remplace console.log)
 │
 ├── app.ts                  → Setup Express, middlewares, routes
 └── server.ts               → HTTP listen uniquement
```

---

## 3. STRUCTURE OBLIGATOIRE PAR MODULE

Chaque module **DOIT** avoir exactement ces 6 fichiers :

```
modules/<name>/
  ├── <name>.controller.ts   → Thin: reçoit req → appelle service → retourne ApiResponse
  ├── <name>.service.ts      → Logique métier, appelle repository
  ├── <name>.repository.ts   → Prisma CRUD uniquement
  ├── <name>.schema.ts       → Schémas Zod (create, update, params, query)
  ├── <name>.route.ts        → Router Express avec validate() + authMiddleware
  └── <name>.types.ts        → Interfaces et types TypeScript du module
```

### Exemple structure fichier : controller

```typescript
// modules/reports/reports.controller.ts
import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { sendSuccess } from '../../utils/response';

export const reportsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportsService.create(req.body, req.user!.userId);
      return sendSuccess(res, 'Report created', data, 201);
    } catch (error) {
      next(error);
    }
  },
};
```

---

## 4. FORMAT RÉPONSE API — TOUJOURS (STRICT)

```typescript
// ✅ Succès
{
  "success": true,
  "message": "string",
  "data": {} | [] | null,
  "error": null,
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } // optionnel (pagination)
}

// ✅ Erreur
{
  "success": false,
  "message": "string",
  "data": null,
  "error": "string" | { field: string, message: string }[]
}
```

**Helpers obligatoires** (middleware `src/core/middleware/response.middleware.ts`) :
```typescript
res.sendSuccess(message, data, statusCode = 200, meta?)
res.sendError(message, statusCode = 400, error?)
```

---

## 5. RÈGLES CONTROLLER

- ✅ Appelle uniquement le service
- ✅ Retourne `ApiResponse` via `sendSuccess` / `sendError`
- ✅ Catch → `next(error)` toujours
- ❌ ZERO logique métier
- ❌ ZERO appels Prisma
- ❌ ZERO appels IA

---

## 6. RÈGLES SERVICE

- ✅ Orchestre la logique métier
- ✅ Appelle les méthodes du repository
- ✅ Enqueue BullMQ via `jobQueue.add()` pour tout appel IA
- ❌ ZERO types Express (`Request`, `Response`)
- ❌ ZERO appels Prisma directs
- ❌ ZERO appels IA inline

---

## 7. RÈGLES REPOSITORY

- ✅ Opérations Prisma CRUD uniquement
- ✅ Retourne des types Prisma ou types du domaine
- ❌ ZERO logique métier
- ❌ ZERO types Express

---

## 8. RÈGLES ROUTE

```typescript
// Pattern OBLIGATOIRE
router.post('/',    validate(schema.create),         authMiddleware, controller.create);
router.get('/',     validate(schema.query, 'query'),  authMiddleware, controller.getAll);
router.get('/:id',  validate(schema.params, 'params'), authMiddleware, controller.getById);
router.patch('/:id', validate(schema.update),         authMiddleware, controller.update);
router.delete('/:id', validate(schema.params, 'params'), authMiddleware, controller.remove);
```

- ✅ `validate()` avant controller toujours
- ✅ `authMiddleware` sur routes protégées
- ❌ ZERO logique inline dans les routes

---

## 9. RÈGLES VALIDATION (ZOD)

- Valider `body`, `params`, ET `query` selon le contexte
- Échec → 422 avec erreurs par champ dans `error`
- Schémas exportés depuis `<module>.schema.ts`

---

## 10. RÈGLES AUTH

| Aspect | Valeur |
|---|---|
| Méthode | JWT Bearer Token |
| Header | `Authorization: Bearer <token>` |
| Payload | `{ userId, role, iat, exp }` |
| Expiry access | 7 jours |
| bcrypt saltRounds | ≥ 12 |
| Middleware | `src/core/middleware/auth.middleware.ts` |

---

## 11. RÈGLES GESTION D'ERREURS

- Toutes les erreurs héritent de `AppError` (`src/core/errors/AppError.ts`)
- Middleware global dans `error.middleware.ts` — TOUJOURS enregistré en dernier dans `app.ts`
- **En production** : NE JAMAIS exposer le stack trace

| Code | Signification |
|---|---|
| 200/201 | Succès |
| 400 | Bad request |
| 401 | Non authentifié |
| 403 | Non autorisé (rôle insuffisant) |
| 404 | Ressource non trouvée |
| 422 | Erreur de validation Zod |
| 500 | Erreur serveur interne |

---

## 12. RÈGLES IA / QUEUE (BULLMQ)

```typescript
// ✅ Correct — dans un service
await jobQueue.add('ai-analysis', { type: 'report-analysis', reportId: '...' });

// ❌ INTERDIT — dans un controller ou service directement
const result = await gemini.generate(...);
```

- Tous les appels Gemini/Groq → **uniquement** dans `src/jobs/ai.processor.ts`
- Nom de queue : `"ai-analysis"` (constante dans `src/core/config/queue.ts`)
- Payload du job : toujours typé avec une interface

---

## 13. RÈGLES ENV

```typescript
// ✅ Correct
import { env } from '../core/config/env';
const port = env.PORT;

// ❌ INTERDIT partout sauf env.ts
const port = process.env.PORT;
```

- `env.ts` valide **toutes** les variables avec Zod au démarrage
- Variable manquante = crash immédiat au démarrage (fail-fast)

---

## 14. RÈGLES PRISMA / DB

```typescript
// ✅ Correct
import { prisma } from '../core/database/prisma';

// ❌ INTERDIT
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // JAMAIS
```

- Une seule instance → `src/core/database/prisma.ts`
- Migrations : `npx prisma migrate dev --name <description>`
- **JAMAIS** `prisma db push` en production

---

## 15. RÈGLES CODE STYLE

| Règle | Valeur |
|---|---|
| TypeScript | Strict, `noImplicitAny`, `strictNullChecks` |
| `any` | INTERDIT — utiliser `unknown` + type guard |
| Async | `async/await` — pas de callbacks, pas de `.then()` raw |
| Exports | Named exports préférés (sauf `app.ts`, `server.ts`) |
| Nommage | Fichiers : `camelCase.type.ts` — Dossiers : `kebab-case` |
| Logs | Logger utility — JAMAIS `console.log` en code production |
| Code mort | INTERDIT — pas de code commenté dans les commits |

---

## 16. PATTERNS INTERDITS (❌)

```
❌ Logique dans les fichiers route
❌ Appels Prisma dans controllers ou services
❌ Appels IA hors src/jobs/
❌ process.env.X hors src/core/config/env.ts
❌ Type `any`
❌ Promesses non gérées
❌ Validation Zod manquante sur un endpoint
❌ Secrets ou clés API en dur
❌ console.log (utiliser logger)
❌ new PrismaClient() hors prisma.ts
```

---

## 17. SCHÉMA PRISMA — RÈGLES

- Le schéma est dans `prisma/schema.prisma`
- Chaque modèle a : `id (uuid)`, `createdAt`, `updatedAt`
- Enums préfixés par leur usage : `ReportStatus`, `EvaluationStatus`, etc.
- Tables mappées en snake_case avec `@@map("table_name")`
- Les champs optionnels sont explicitement marqués avec `?`
- **Aucun** champ `Json` brut pour des données structurées sans raison

---

## 18. ORDRE DE CRÉATION DES MODULES

1. `auth` — Base de l'authentification JWT
2. `reports` — CRUD signalements
3. `evaluations` — CRUD évaluations
4. `ai` — Endpoints AI + queue
5. `decisions` — CRUD décisions

---

## 19. SCRIPTS package.json

```json
{
  "dev":              "ts-node-dev --respawn --transpile-only src/server.ts",
  "build":            "tsc",
  "start":            "node dist/server.js",
  "prisma:migrate":   "npx prisma migrate dev",
  "prisma:generate":  "npx prisma generate",
  "prisma:studio":    "npx prisma studio"
}
```

---

## 20. CHECKLIST AVANT MERGE

- [ ] TypeScript compile sans erreur (`npm run build`)
- [ ] Zod schema présent pour chaque route
- [ ] Controller ne contient que le pattern try/catch → next
- [ ] Service ne contient aucun import Express
- [ ] Repository ne contient que des appels Prisma
- [ ] Réponse API respecte le format `{ success, message, data, error }`
- [ ] Aucun `any` dans le diff
- [ ] Aucun `console.log` dans le diff
- [ ] Variables d'env accessibles uniquement via `env.ts`
