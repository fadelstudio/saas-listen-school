# 📋 DOCUMENT TECHNIQUE — AFI-LISTEN
## Hackathon AFI-TECH 2026 | Écouter les étudiants africains, comprendre, transformer

---

## 1. SÉCURITÉ — ARCHITECTURE MULTICOUCHE

### 1.1 Authentification & Sessions

**JWT à double token (Access + Refresh)**
- **Access Token** : signé HS256 avec `JWT_SECRET`, durée **1 heure**
  - Payload : `{ userId, role, sid, schoolId, campusIds, classId }`
  - Le champ `sid` (Session ID, 16 bytes random hex) identifie la session active
- **Refresh Token** : 40 bytes aléatoires (non-JWT), durée **30 jours**, stocké hashé en base
- Rotation automatique à chaque refresh → invalidation de l'ancien token

**Enforcement de session unique**
```
Login → génère sessionId → stocké dans users.currentSessionId
Token JWT → contient sid
Chaque requête → authMiddleware compare payload.sid vs users.currentSessionId
Si différent → 401 "Session expirée : une autre connexion a été détectée"
```
Valeur ajoutée : **un compte = un appareil actif** → sécurité renforcée, pas de partage de compte.

### 1.2 Système OTP — Configuration Flexible

L'OTP peut être activé à **trois niveaux** :

| Niveau | Variable/Paramètre | Portée |
|--------|-------------------|--------|
| Global ENV | `LOGIN_OTP_ENABLED=true` | Toutes les écoles |
| Par école (DB) | `systemSettings.authOtpRequired` | École spécifique |
| Fallback dev | `OTP_FALLBACK_CODE=123456` | Bypass pour tests |

**Comportement :**
- OTP 6 chiffres numériques, hashé SHA-256 avec le `JWT_SECRET` avant stockage
- Expiration : **10 minutes**
- Maximum **5 tentatives** → blocage du compte à la 5ème tentative échouée
- Lien de vérification one-click inclus dans l'email (expérience UX améliorée)
- Email configuré via Brevo (Sendinblue) ou Nodemailer SMTP

### 1.3 Contrôle d'accès basé sur les rôles (RBAC)

```
SUPERADMIN → accès total à toutes les écoles, aucun filtre schoolId
ADMIN      → accès total à son école (tous campus, toutes classes)
MANAGER    → restreint à ses campusIds assignés
AGENT      → idem MANAGER, permissions en lecture étendue
VIEWER     → lecture seule, AUCUNE action d'écriture autorisée
PROFESSOR  → accès limité à ses modules/classes
STUDENT    → espace personnel + campagnes qui le concernent
```

**Middleware chain pour chaque route protégée :**
```
resolveSchoolMiddleware  →  authMiddleware  →  requireRole(...)  →  Handler
        │                        │                   │
   Résout schoolId          Vérifie JWT         Vérifie rôle
   multi-tenant             + session SID        + scope campus
```

### 1.4 Paramètres d'authentification configurables par école

| Paramètre | Type | Valeur par défaut | Impact |
|-----------|------|------------------|--------|
| `authOtpRequired` | Boolean | `false` | Activer OTP à l'inscription |
| `authReportsRequired` | Boolean | `false` | Login requis pour signaler |
| `authEvaluationsRequired` | Boolean | `false` | Login requis pour évaluer |
| `aiEnabled` | Boolean | `true` | Activer/désactiver l'IA |

**Valeur ajoutée** : chaque établissement personnalise son niveau de sécurité et sa politique de confidentialité sans toucher au code.

### 1.5 Sécurité HTTP (Headers & Rate Limiting)

- **Helmet.js** : `Content-Security-Policy`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`, `X-Content-Type-Options`
- **CORS** configuré par origine (dashboard web uniquement)
- **Rate Limiting** : `express-rate-limit` sur toutes les routes publiques
- **Compression GZIP** : réduction ~70% de la taille des réponses JSON
- **Validation Zod** : toutes les entrées API sont validées avec schéma strict avant traitement
- **SQL Injection** : impossible via Prisma ORM (paramétrage natif). Pour les requêtes raw du chat IA → whitelist `SELECT` uniquement, blocage de `DROP/DELETE/UPDATE/INSERT/TRUNCATE/ALTER`

### 1.6 Stockage sécurisé

- **Mots de passe** : bcrypt avec **12 rounds de sel** (OWASP recommande 10-12)
- **OTP** : jamais stocké en clair, SHA-256 avec sel JWT_SECRET
- **Reset tokens** : SHA-256 avec sel, usage unique (`usedAt` marqué)
- **Clés API IA** : stockées en base chiffrée (JSON), masquées à l'affichage, préservées lors des mises à jour
- **Fichiers** : Supabase Storage avec URLs signées à durée limitée

### 1.7 Traçabilité — Audit Log

Chaque action sensible génère une entrée `AuditLog` :
```json
{
  "schoolId": "afi",
  "userId": "uuid-admin",
  "action": "CREATE_CAMPAIGN | CLOSE_CAMPAIGN | SEND_REMINDERS | ...",
  "entity": "EvaluationCampaign",
  "entityId": "uuid",
  "details": { "title": "...", "scope": "CLASS" },
  "ipAddress": "...",
  "userAgent": "...",
  "createdAt": "2026-05-13T..."
}
```
Index par `(schoolId, createdAt)` et `(userId, createdAt)` → requêtes rapides.

---

## 2. FLEXIBILITÉ DES PARAMÈTRES — SYSTÈME SAAS

### 2.1 Paramètres système par école (SystemSettings)

```typescript
// Modèle SystemSettings (un enregistrement par école)
{
  schoolId: string          // Clé unique par tenant
  schoolName: string        // Nom affiché dans l'IA et les emails

  // Auth Toggles (configurables dans le dashboard admin)
  authReportsRequired:     boolean  // Signalement public ou authentifié
  authEvaluationsRequired: boolean  // Évaluation publique ou authentifiée
  authOtpRequired:         boolean  // Vérification email par OTP

  // IA Multi-Provider
  aiEnabled:          boolean  // Activer/désactiver toute l'IA
  aiConfigs:          Json     // Array de configs provider (voir section IA)
  aiOverrideConfigId: string?  // Forcer un modèle spécifique

  updatedAt: DateTime
}
```

**Cache côté serveur** : settings mis en cache 30 secondes en mémoire par école → aucun impact performance sur les routes fréquentes.

### 2.2 Configuration IA par école

Les administrateurs configurent leurs providers IA directement dans le dashboard :

```json
// systemSettings.aiConfigs (JSON stocké en base)
[
  {
    "id": "cfg-1",
    "name": "Gemini Principal",
    "provider": "GEMINI",
    "apiKey": "AIza...",
    "preferredModel": "gemini-2.5-flash",
    "priority": 1
  },
  {
    "id": "cfg-2",
    "name": "Groq Backup",
    "provider": "GROQ",
    "apiKey": "gsk_...",
    "priority": 2
  }
]
```

**Valeur ajoutée** :
- Chaque école peut avoir ses **propres clés API** → facturation IA indépendante
- L'override (`aiOverrideConfigId`) permet de forcer un modèle → A/B testing entre providers
- Changement immédiat sans redémarrage du serveur

### 2.3 Paramètres publics (endpoint sans authentification)

```
GET /api/system/public-settings
Response: {
  schoolSlug, schoolName, logoUrl,
  aiEnabled, authOtpRequired,
  authReportsRequired, authEvaluationsRequired
}
```

Le frontend (web + mobile) lit ces toggles **avant** d'afficher les formulaires :
- Si `authReportsRequired = false` → afficher formulaire sans login + toggle anonymat
- Si `authReportsRequired = true` → masquer toggle anonymat, rediriger vers login si nécessaire

---

## 3. MOTEUR IA — SPÉCIFICATIONS TECHNIQUES

### 3.1 AiBalancer — Algorithme de basculement

**États de défaillance gérés :**
- `isQuota: true` → cooldown **5 minutes** (erreur 429 ou quota dépassé)
- `permanent: true` → blacklisté définitivement cette session (erreur 404, modèle inexistant)
- Standard → cooldown **1 minute**

**Fast-path** : le dernier modèle ayant réussi est essayé en premier → réduction de latence jusqu'à 80%.

**Persistance du modèle actif** : `redis.set('ai_balancer:current_active_id', id, 'EX', 3600)` → cohérence entre redémarrages.

### 3.2 ModelDiscovery — Auto-découverte des modèles

```
Provider GEMINI → GET https://generativelanguage.googleapis.com/v1beta/models?key=...
Provider GROQ   → GET https://api.groq.com/openai/v1/models
Provider OPENAI → GET https://api.openai.com/v1/models
                        │
                  Filtrage : modèles texte uniquement
                  Tri : par date/capacité
                  Cache : 1 heure par (provider + apiKey)
                  Résultat : top 5 modèles par provider
```

### 3.3 Pipeline Chat IA (MyIA)

**Étape 1 — Décision routing :**
- Question sur les données → génère SQL
- Demande d'action (signaler, évaluer) → `INTENT_ACTION`
- Salutation/hors-sujet → `NO_QUERY`

**Étape 2 — Génération SQL avec règles strictes :**
- Toujours `WHERE schoolId = '...'` → isolation multi-tenant
- MANAGER → restriction supplémentaire sur `campusId IN (...)` injectée dans le prompt
- Jamais `LIMIT 1` pour les classements → résultats complets
- `CAST(col AS TEXT)` pour tous les enums PostgreSQL
- Guillemets doubles obligatoires sur colonnes camelCase

**Étape 3 — Auto-correction SQL :**
- Si SQL échoue → erreur renvoyée à l'IA avec le message d'erreur PostgreSQL
- L'IA génère une requête corrigée → 2e tentative d'exécution
- Maximum 2 tentatives avant réponse d'erreur

**Étape 4 — Détection graphique automatique :**
```
rows avec colonne date/month  → Line chart (time-series)
rows avec colonne status/type → Pie (≤6 lignes) ou Bar
rows avec colonne name/campus → Bar chart (ranking)
Résultat : { type, title, labels[], datasets[] }
```

**Étape 5 — Génération réponse naturelle :**
- Données factuelles uniquement (jamais d'invention)
- Ton assertif (jamais "il me semble", "d'après les données")
- Mention du graphique si généré
- Action intent → préfill JSON pour formulaire (`json_action`)

### 3.4 Analyse Post-Campagne (IA Autonome)

Déclenchée automatiquement à la clôture d'une campagne :
```
1. Récupère stats (participation %, score moyen /20, commentaires)
2. Construit prompt structuré avec contexte campagne
3. AiBalancer.callAI() → JSON { summary, recommendation, priority }
4. Crée Decision (status: PROPOSED) attachée à la campagne
5. Notifie les admins/managers via push FCM
6. Gestion concurrence : P2002 (unique constraint) → récupère décision existante
```

---

## 4. SYSTÈME DE NOTIFICATIONS — ARCHITECTURE MULTI-CANAL

### 4.1 Types de notifications

| Type | Déclencheur | Canal |
|------|------------|-------|
| `LOGIN_WELCOME` | Connexion réussie | In-app |
| `EVALUATION_CAMPAIGN` | Création d'une campagne | Push FCM + In-app |
| `EVALUATION_CAMPAIGN_REMINDER` | Rappel manuel admin | Push FCM + In-app |
| `AI_FAILURE` | Panne provider IA | In-app admin |
| `SYSTEM` | Broadcast système | In-app |
| `BROADCAST` | Message admin général | Push FCM + In-app |

### 4.2 Ciblage multi-dimensionnel

```typescript
// Modèle Notification — ciblage flexible
{
  userId: string?          // Ciblage individuel direct
  targetUserIds: string[]  // Ciblage liste d'utilisateurs
  targetRoles: Role[]      // Ciblage par rôle (ADMIN, MANAGER...)
  targetCampusIds: string[] // Ciblage par campus
  targetClassIds: string[]  // Ciblage par classe
  targetDeviceUti: string?  // Ciblage invité anonyme (UUID appareil)
}
```

**Push Firebase (FCM)** :
- Token FCM stocké dans `users.fcmToken` (authentifiés) et `guest_devices.fcmToken` (invités)
- Mise à jour du token à chaque lancement de l'app mobile
- Foreground : notification locale via `flutter_local_notifications`
- Background/Killed : notification native Android/iOS
- Rafraîchissement automatique du badge quand notification reçue en foreground

### 4.3 Rappels de campagne intelligents

```
Admin déclenche sendReminders(campaignId)
      │
  Récupère tous les étudiants du scope (classe/campus/école)
      │
  Exclut ceux qui ont déjà soumis une évaluation
      │
  Notification push uniquement aux non-participants
      │
  AuditLog: SEND_CAMPAIGN_REMINDERS
```

---

## 5. MODE INVITÉ & FUSION D'IDENTITÉ

### 5.1 Mode Invité (Guest)

L'application mobile et le portail web permettent de signaler **sans créer de compte** :

1. **UTI (Unique Tracking Identifier)** : UUID généré et persisté localement (SharedPreferences)
2. L'UTI est envoyé avec chaque signalement → `report.deviceMetadata`
3. Notifications push possibles via `GuestDevice.fcmToken` (lié à l'UTI)
4. Paramètre `authReportsRequired` contrôle si le mode invité est autorisé pour les signalements
5. Paramètre `authEvaluationsRequired` contrôle de même pour les évaluations

**Données collectées anonymement** :
- Contenu du signalement
- Type, priorité, catégorie
- Classe/professeur/module concerné (sélectionnés dans listes publiques)
- Métadonnées appareil (OS, version app) — pour analyse contextuelle uniquement

### 5.2 Fusion Guest → Étudiant authentifié

Quand un invité crée un compte :
1. Le backend identifie les anciens signalements via l'UTI du device
2. Mise à jour `report.authorId = userId` sur les signalements orphelins
3. L'étudiant retrouve son historique complet dans son espace personnel

### 5.3 Données publiques disponibles sans authentification

```
GET /api/system/public-settings → Toggles école, nom, logo
GET /api/system/public-form-data → Campuses, classes, professeurs, modules
```
Ces endpoints permettent de **pré-remplir les formulaires** de signalement/évaluation pour les invités, avec les données réelles de l'école, sans exposer d'informations sensibles.

---

## 6. CAMPAGNES D'ÉVALUATION — LIFECYCLE COMPLET

### 6.1 États et transitions

```
DRAFT ──► ACTIVE ──► COMPLETED ──► (ACTIVE via relaunch)
  │           │
  │    (dueDate atteint OU clôture manuelle)
  │           │
  │      Auto-analyse IA → Decision PROPOSED
  │           │
  │      Notification admins
  └── (suppression possible si jamais activée)
```

### 6.2 Portée (Scope) et isolation

| Scope | Étudiants ciblés | Droits création |
|-------|-----------------|-----------------|
| `CLASS` | Étudiants de la classe | ADMIN, MANAGER (si leur campus) |
| `CAMPUS` | Étudiants du campus | ADMIN, MANAGER (si leur campus) |
| `SCHOOL` | Tous les étudiants | ADMIN, SUPERADMIN uniquement |

### 6.3 Critères d'évaluation — Grille /20

```
comprehensionRating  → Compréhension du cours
explanationRating    → Clarté des explications
pedagogyRating       → Qualité pédagogique
availabilityRating   → Disponibilité du professeur
rhythmRating         → Rythme du cours

Chaque critère : VERY_POOR | POOR | FAIR | GOOD | EXCELLENT
Score /20 : pondération équitable des 5 critères
Score IA (aiScore) : analyse sémantique du commentaire libre
```

### 6.4 Protection et équité

- Un étudiant ne peut soumettre **qu'une seule évaluation** par campagne (contrainte DB)
- L'anonymat est optionnel (`isAnonymous`) selon la configuration de l'école
- Les campagnes clôturées bloquent automatiquement toute nouvelle soumission
- Relaunch possible : prolonge d'une semaine, repasse en `ACTIVE`

---

## 7. DÉPLOIEMENT IDÉAL — RECOMMANDATIONS

### 7.1 Architecture de production recommandée

| Composant | Service recommandé | Justification |
|-----------|-------------------|---------------|
| **API Backend** | Render.com (Web Service) | Auto-deploy, health checks, HTTPS |
| **Worker IA** | Render.com (Background Worker) | Isolation processus, scaling indépendant |
| **Base de données** | Supabase PostgreSQL | PgBouncer intégré, backups auto, dashboard |
| **Cache/Queue** | Upstash Redis | Serverless, pas de gestion infra, DB 0 forcée |
| **Fichiers** | Supabase Storage | Intégration native, URLs signées |
| **Push Mobile** | Firebase Cloud Messaging | Standard industrie iOS/Android |
| **Dashboard Web** | Vercel | SSR optimisé Next.js, CDN global |
| **App Mobile** | Google Play + App Store | Distribution officielle |
| **Monitoring** | Render Metrics + Winston logs | Alertes, traces, logs structurés |

### 7.2 Configuration base de données optimale

```
DATABASE_URL  → postgresql://user:pass@host:6543/db?pgbouncer=true&connection_limit=5
DIRECT_URL    → postgresql://user:pass@host:5432/db
```
- Port **6543** (Transaction Mode) pour les requêtes applicatives → pool partagé, max connexions
- Port **5432** (Session Mode) pour les migrations `prisma migrate deploy` uniquement

### 7.3 Pipeline de déploiement

```
Push Git → Render détecte le commit
         → npm ci && npx prisma generate && npm run build
         → npx prisma migrate deploy (migrations auto)
         → node dist/server.js
         → Health check /health → mise en ligne
```

### 7.4 Scalabilité horizontale

- **API** : stateless (JWT, pas de session serveur) → scaling horizontal natif
- **Worker** : indépendant, peut être répliqué → plusieurs workers BullMQ en parallèle
- **Redis** : point de synchronisation entre instances → état partagé cohérent
- **Base de données** : PgBouncer gère le pool → connexions limitées mais partagées efficacement

---

## 8. INDICATEURS CLÉS (KPIs TECHNIQUES)

### 8.1 Performance API

| Métrique | Valeur cible | Moyen d'atteinte |
|----------|-------------|-----------------|
| Latence p50 | < 150ms | Prisma optimisé, cache settings 30s |
| Latence p99 | < 500ms | Index DB optimisés, GZIP |
| Latence Chat IA | < 3s (Groq) / < 8s (Gemini) | Fast-path, multi-provider |
| Disponibilité | > 99.5% | Multi-provider IA, health checks |
| Connexions DB max | 5 par instance | PgBouncer transaction mode |

### 8.2 Indicateurs fonctionnels mesurables

| KPI | Requête SQL générée par MyIA |
|-----|------------------------------|
| Taux de participation campagne | `(évaluations soumises / étudiants ciblés) * 100` |
| Score moyen professeur /20 | `AVG(evaluation.score) GROUP BY professorId` |
| Temps moyen traitement signalement | `AVG(updatedAt - createdAt) WHERE status = 'APPROVED'` |
| Taux de signalements critiques | `COUNT(priority IN ('HIGH','CRITICAL')) / COUNT(*) * 100` |
| Signalements sans suite | `COUNT(*) WHERE status NOT IN ('APPROVED','REJECTED') AND createdAt < NOW()-30d` |

### 8.3 Indicateurs IA

| Métrique | Description |
|----------|-------------|
| Provider actif | Gemini / Groq / OpenAI / Anthropic (visible dans dashboard) |
| Basculements last 24h | Comptés via notifications AI_FAILURE |
| Décisions IA acceptées | `COUNT(decisions WHERE aiSuggestion IS NOT NULL AND status = 'APPROVED')` |
| Décisions IA rejetées | `COUNT(decisions WHERE status = 'REJECTED')` |

---

## 9. LIMITES ET CONTRAINTES SYSTÈME

### 9.1 Limites techniques configurables

| Limite | Valeur par défaut | Variable ENV |
|--------|------------------|-------------|
| Taille fichier upload | 10 MB | `MAX_FILE_SIZE_MB` |
| Expiration URL signée | 3600s | `SIGNED_URL_EXPIRES_IN` |
| Pool connexions DB | 5 | `DB_POOL_MAX` |
| Access Token durée | 1 heure | Hardcodé (modifiable src) |
| Refresh Token durée | 30 jours | Hardcodé (modifiable src) |
| OTP expiration | 10 minutes | Hardcodé (modifiable src) |
| OTP max tentatives | 5 | Hardcodé (modifiable src) |
| Reset password expiration | 1 heure | Hardcodé (modifiable src) |
| Cache settings | 30 secondes | Hardcodé (modifiable src) |
| Cache modèles IA | 1 heure | Hardcodé (modifiable src) |
| Historique chat IA | 12 derniers messages | Hardcodé |
| Conversations IA par user | 30 dernières | Hardcodé |

### 9.2 Limites opérationnelles

- **Redis DB 0** uniquement → compatibilité hébergements partagés (Upstash, Redis Cloud)
- **`enableOfflineQueue: false`** → les requêtes Redis échouent proprement si Redis est down (pas de blocage)
- **`maxRetriesPerRequest: null`** → BullMQ gère ses propres retries (recommandation officielle)
- **PostgreSQL** : index optimisés sur `(schoolId, createdAt)`, `(userId, isRead)`, `(campaignId, type)` → lectures rapides même avec plusieurs milliers d'enregistrements

### 9.3 Contraintes de sécurité non contournables

- Un token JWT avec `sid` différent du `currentSessionId` en base → rejet immédiat (400ms max)
- Toute requête raw SQL (chat IA) commençant par autre chose que `SELECT` → rejetée sans exécution
- Un VIEWER ne peut effectuer aucune mutation (contrôle middleware + contrôle service)
- Un MANAGER ne peut accéder qu'à ses campus assignés → vérifié à chaque route
- Le `schoolId` dans le JWT doit correspondre au `schoolId` résolu par le middleware → protection cross-tenant

---

## 13. ANNONCES & PIÈCES JOINTES — EXTENSIONS RÉCENTES

### 13.1 Module Annonces (Publicité)

Permet de diffuser des messages administratifs ciblés avec une gestion stricte de l'état actif.

- **Contrainte d'unicité** : Une seule annonce active par `schoolId` à un instant T.
- **Désactivation automatique** : L'activation d'une annonce (via `create` ou `update`) déclenche la mise à `isActive: false` de toutes les autres annonces de l'école.
- **Broadcast automatique** : L'activation d'une annonce déclenche une notification de type `ANNOUNCEMENT` à l'échelle de l'école.
- **Stockage image** : Les visuels d'annonces sont stockés sur Supabase Storage (bucket configuré).

### 13.2 Pièces Jointes (Signalements & Suggestions)

Les rapports supportent désormais des pièces jointes riches pour faciliter la preuve ou l'explication.

- **Types supportés** : 
    - **Photos/Images** : JPEG, PNG, WebP
    - **Documents** : PDF
    - **Vocal** : Audio (WAV, MP3, WebM) - **Limite conseillée : 1 minute**.
- **Structure JSON** : Stockage dans la colonne `attachments` de type `Json` dans la table `Report`.
- **Intégration Stockage** : Les fichiers sont uploadés via `uploadsService` dans des dossiers séparés (ex: `reports/`, `announcements/`).
- **Affichage** : Les URLs sont retournées nativement dans les objets `Report` récupérés via l'API.

---

## 14. LIMITES ET CONTRAINTES SYSTÈME (MAJ)

### 10.1 Hiérarchie d'erreurs applicatives

```typescript
AppError (base)
├── UnauthorizedError  → HTTP 401
├── ForbiddenError     → HTTP 403
├── NotFoundError      → HTTP 404
├── ConflictError      → HTTP 409
└── BadRequestError    → HTTP 400
```

Chaque erreur est capturée par le `error.middleware` → réponse JSON standardisée :
```json
{ "success": false, "message": "...", "statusCode": 401 }
```

### 10.2 Résilience IA

- Basculement automatique entre providers sans intervention humaine
- Notification admin throttlée (1 par type d'événement par école toutes les 5 minutes)
- Si TOUS les providers échouent → erreur explicite + notification admin critique
- Le worker BullMQ gère les retries automatiques sur les jobs IA

### 10.3 Résilience base de données

- **PgBouncer** : évite l'épuisement du pool de connexions (`EMAXCONNSESSION`)
- **Prisma** : reconnexion automatique avec backoff
- **Contrainte P2002** (unique constraint) : gérée gracieusement dans les services critiques (ex: création de décision concurrente)

---

## 11. VALEUR AJOUTÉE PAR ASPECT

### Pour les Étudiants (App Mobile)
- **Dark/Light mode** : confort visuel → `AppTheme.themeManager` (ValueNotifier persisté)
- **Cache offline** : données consultables sans connexion → `CacheService` (SharedPreferences)
- **Mode invité** : signaler sans créer de compte → inclusivité maximale
- **Anonymat configurable** : protège l'étudiant selon les règles de l'école
- **Notifications push** : informé en temps réel des campagnes et rappels

### Pour les Administrateurs (Dashboard Web)
- **MyIA (chat NL)** : interroger les données en français naturel → démocratise l'analyse
- **Graphiques auto-générés** : line/bar/pie selon le type de données → pas besoin de BI externe
- **Décisions IA pré-remplies** : gain de temps, base de réflexion structurée
- **Broadcast ciblé** : notifier par rôle/campus/classe/utilisateurs spécifiques
- **Audit trail complet** : chaque action tracée avec utilisateur, horodatage, IP

### Pour l'Institution (SaaS)
- **Multi-tenant natif** : N écoles sur une instance → réduction des coûts infra
- **Clés IA par école** : chaque établissement maîtrise ses coûts IA
- **Déploiement en minutes** : nouvelle école = seed BDD + configuration = opérationnel
- **Swagger intégré** : documentation API auto-générée, facilite les intégrations futures

---

## 12. CONFORMITÉ & BONNES PRATIQUES

| Pratique | Implémentation |
|----------|---------------|
| **OWASP Top 10** | Injection SQL impossible (Prisma + whitelist SELECT), XSS (Helmet CSP), Auth forte (JWT+bcrypt) |
| **RGPD** | Anonymat opt-in, `deviceMetadata` limité au contexte, suppression compte possible |
| **REST Standards** | Pagination standardisée, codes HTTP corrects, réponses JSON cohérentes |
| **12-Factor App** | Config via ENV, logs sur stdout (Winston), stateless API, processus séparés (API/Worker) |
| **Swagger/OpenAPI** | Documentation auto-générée sur `/api-docs` |
| **TypeScript strict** | Réduction bugs runtime, contrats forts entre modules |

---

*Document technique généré le 13 mai 2026 — Version 1.0 — Hackathon AFI-TECH 2026*
*Plateforme AFI-LISTEN — Backend: Node.js/Express/Prisma | Web: Next.js | Mobile: Flutter*
