# Architecture Technique

AFI-LISTEN est une application SaaS de pilotage académique basée sur une architecture modulaire, asynchrone et orientée IA.

## 🏛 Structure Globale

L'application suit une structure **Module-Based Architecture** : Chaque domaine fonctionnel (auth, reports, evaluations...) regroupe ses propres controllers, services, repositories et types.

```text
src/
├── core/             # Configuration cross-modules
│   ├── config/       # Swagger, Redis, BullMQ, Prisma
│   ├── middleware/   # Auth, Validation, Error, Response
│   └── routes/       # Agrégation des routes (v1)
├── modules/          # Coeur métier (Organisé par domaine)
│   ├── [module]/
│   │   ├── *.controller.ts
│   │   ├── *.service.ts
│   │   ├── *.repository.ts
│   │   ├── *.schema.ts (Zod)
│   │   └── *.route.ts
├── jobs/             # BullMQ Workers (Traitement asynchrone)
├── queues/           # Définition des files d'attente
├── utils/            # Helpers (Logger, Pagination, AI Helpers)
└── server.ts         # Point d'entrée
```

## 🚀 Stack Technique

- **Backend** : Node.js + Express + TypeScript
- **Base de données** : PostgreSQL + Prisma ORM
- **Cache & Queue** : Redis + BullMQ
- **IA** : Google Gemini (via AiBalancer pour le multi-model)
- **Validation** : Zod
- **Documentation** : Swagger (OpenAPI 3.0)

## 🧠 Principes de Design

### 1. Asynchronisme (Background Processing)
Les opérations lourdes (appel IA, génération de synthèses) ne sont jamais faites dans le cycle requête/réponse. Elles sont déléguées à **BullMQ**. L'API répond immédiatement un `201 Accepted` ou déclenche le job en arrière-plan.

### 2. Isolation des données (Repositories)
Le `Service` contient la logique métier et appelle le `Repository` pour les accès DB. Cela permet de changer d'ORM ou de base de données sans impacter tout le code.

### 3. Sécurité Dynamique
Le middleware `dynamicAuthMiddleware` permet d'activer ou désactiver l'authentification sur certains endpoints (ex: signalements publics) directement depuis les réglages système (`SystemSettings`) en base de données, sans redémarrer le serveur.

### 4. IA-First
Chaque entité majeure (Report, Evaluation, Decision) possède un champ `aiAnalysis` ou `aiScore` et un lien vers `AiJob` pour tracer l'historique des traitements intelligents.
