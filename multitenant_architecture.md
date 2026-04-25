# 🏗️ AFI-LISTEN — Architecture Multi-Tenant : Web, API & Mobile

> **Version :** 1.0 | **Date :** 2026-04-25  
> **Statut :** Référence Technique — Architecture de Production

---

## 1. Résumé Exécutif

AFI-LISTEN est une plateforme SaaS multi-tenant qui permet à **N écoles indépendantes** de coexister sur la même infrastructure. Chaque école est appelée un **tenant**. L'isolation des données est assurée à deux niveaux :

1. **Résolution du tenant au niveau de la requête HTTP** (via `resolveSchoolMiddleware`)
2. **Isolation des données via le JWT** (le `schoolId` est embedé dans le token)

---

## 2. Comment l'École est Identifiée dans l'API

Le middleware `resolveSchoolMiddleware` (exécuté avant toutes les routes métier) résout l'école selon une **cascade de priorités** :

```
Priorité 1 → Sous-domaine HTTP    : afi.mondomaine.com       → slug = "afi"
Priorité 2 → Header HTTP         : x-school-slug: afi        → slug = "afi"
Priorité 3 → Path URL (non-str.) : /afi/api/v1/reports       → slug = "afi"
Priorité 4 → Variable ENV        : DEFAULT_SCHOOL_SLUG=afi   → slug = "afi"
```

Une fois le slug résolu, la table `schools` est interrogée pour récupérer `schoolId`, qui est ensuite attaché à `req.school` et `req.schoolId`.

### Modes de Fonctionnement

| Mode | Variable | Comportement |
|---|---|---|
| **Strict** | `TENANT_STRICT_MODE=true` | Priorité 1 et 2 uniquement. Aucun repli. |
| **Non strict** | `TENANT_STRICT_MODE=false` | Toutes les priorités actives. Repli sur `DEFAULT_SCHOOL_SLUG`. |

---

## 3. Le Rôle du JWT dans l'Isolation des Données

Après une connexion réussie, le JWT généré contient :

```json
{
  "userId": "uuid",
  "role": "STUDENT",
  "schoolId": "uuid-de-lecole",
  "campusIds": ["uuid-campus-1"],
  "classId": "uuid-classe",
  "sid": "session-id-unique",
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Conséquence importante :** Pour toutes les routes protégées (après `authMiddleware`), le `schoolId` est extrait du JWT. **Aucune résolution de tenant depuis l'URL n'est nécessaire** pour ces routes.

---

## 4. Stratégie d'Identification du Tenant par Plateforme

### 4.1 Web (Dashboard Next.js)

**Méthode actuelle :** Path-based routing + Header `x-school-slug`

```
URL : /afi/dashboard/reports
API : /api/v1/reports (avec header x-school-slug: afi)
```

- Le slug est dans l'URL (`[slug]/dashboard/...`)
- Le `LayoutProvider` lit le slug depuis l'URL et injecte le header `x-school-slug` dans toutes les requêtes API
- ✅ **Fonctionnel et simple**

### 4.2 API REST Directe (Postman / Intégrations)

**Méthode recommandée :** Header `x-school-slug`

```http
GET /api/v1/reports
Authorization: Bearer eyJhbGci...
x-school-slug: afi
```

- ✅ **Simple, universel, compatible avec toutes les plateformes**
- ✅ **Préféré pour les tests et intégrations tierces**

### 4.3 📱 Application Mobile (React Native, Flutter, etc.)

**Problème :** Le mobile ne peut pas utiliser les sous-domaines et ne gère pas le routing URL comme un navigateur web.

**Solution : Le `x-school-slug` header + JWT auto-suffisant**

#### Flux Mobile Complet

```
┌─────────────────────────────────────────────────────┐
│  ONBOARDING (1 seule fois)                          │
│                                                     │
│  Option A : L'utilisateur saisit un "code école"   │
│             (ex: "afi") dans l'écran de login       │
│                                                     │
│  Option B : Détection automatique via le domaine   │
│             email (user@afi-ue.sn → slug="afi")    │
│             (champ School.domain dans le schéma)   │
└────────────────────────┬────────────────────────────┘
                         │ Stocker slug dans AsyncStorage / SecureStore
                         ▼
┌─────────────────────────────────────────────────────┐
│  LOGIN                                              │
│                                                     │
│  POST /api/auth/login                               │
│  Headers: { x-school-slug: "afi" }                  │
│  Body: { email, password }                          │
│                                                     │
│  → Réponse : { token, refreshToken, user }          │
│  → Le JWT contient schoolId, campusIds, classId     │
└────────────────────────┬────────────────────────────┘
                         │ Stocker JWT dans SecureStore
                         ▼
┌─────────────────────────────────────────────────────┐
│  TOUTES LES REQUÊTES SUIVANTES                      │
│                                                     │
│  GET /api/notifications                             │
│  Headers: {                                         │
│    Authorization: "Bearer <jwt>",                   │
│    x-school-slug: "afi"    ← optionnel après login  │
│  }                                                  │
│                                                     │
│  Le JWT seul suffit pour l'isolation des données !  │
│  (schoolId est dans le payload JWT)                 │
└─────────────────────────────────────────────────────┘
```

#### Configuration de l'API Client Mobile (exemple React Native)

```typescript
// api.client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://afi-listen-api.onrender.com/api/v1';

const apiClient = axios.create({ baseURL: API_URL });

// Intercepteur : injecte automatiquement le token et le slug école
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  const schoolSlug = await AsyncStorage.getItem('school_slug');
  
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  if (schoolSlug) config.headers['x-school-slug'] = schoolSlug;
  
  return config;
});
```

#### Endpoint de Résolution de Slug par Domaine Email (à implémenter)

Pour améliorer l'UX mobile, on peut ajouter un endpoint public permettant à l'app de résoudre le slug depuis l'email :

```http
GET /api/v1/saas/resolve?email=user@afi-ue.sn
→ { slug: "afi", name: "AFI L'UE" }
```

Cela évite que l'utilisateur n'ait à saisir manuellement son code école.

---

## 5. Tableau Comparatif des Méthodes de Résolution

| Méthode | Web | Mobile | API Direct | Complexité |
|---|:---:|:---:|:---:|:---:|
| **Sous-domaine** (`afi.host.com`) | ✅ Idéal | ❌ Impossible | ⚠️ Dépend DNS | Élevée |
| **Header `x-school-slug`** | ✅ Via interceptor | ✅ Via interceptor | ✅ Simple | Faible |
| **Path URL** (`/afi/api/v1`) | ✅ Actuel | ⚠️ Possible | ✅ | Moyenne |
| **JWT embarqué** | ✅ Post-login | ✅ Post-login | ✅ Post-login | Nulle |
| **Email domain** (auto-resolve) | ✅ UX | ✅ UX | ➖ | Faible |

> **⚠️ Important :** Pour les routes publiques (register, login, mot de passe oublié), le `x-school-slug` header est **obligatoire** car le JWT n'existe pas encore.  
> Pour les routes protégées (tout après `authMiddleware`), le header est **optionnel** car le schoolId vient du JWT.

---

## 6. Mécanismes de Sécurité Actifs

### 6.1 Session Unique (`currentSessionId`)
- À chaque login, un `sessionId` unique est généré et stocké en DB et dans le JWT (`sid`)
- `authMiddleware` vérifie que le `sid` du JWT correspond bien à `users.currentSessionId`
- **Résultat :** Une reconnexion depuis un autre appareil invalide immédiatement les sessions précédentes

### 6.2 Isolation Inter-Tenant
- `resolveSchoolMiddleware` : garantit que toute requête est associée à une école valide en DB
- `authMiddleware` : vérifie que `req.schoolId` correspond à `payload.schoolId` (empêche les utilisateurs d'une école d'accéder aux données d'une autre)

### 6.3 Refresh Token Rotation
- Access Token : **15 minutes** (court pour limiter l'exposition)
- Refresh Token : **7 jours** (long pour l'UX mobile)
- Rotation : chaque `/auth/refresh` invalide l'ancien refresh token et en émet un nouveau

---

## 7. Ce Qui Reste à Implémenter pour le Mobile

| Feature | Priorité | Description |
|---|:---:|---|
| `GET /saas/resolve-school?email=` | 🔴 Haute | Résolution auto du slug via domaine email |
| Endpoint push FCM | 🔴 Haute | `PATCH /auth/me/fcm-token` pour enregistrer le token FCM |
| Envoi de push réel | 🔴 Haute | Intégration Firebase Admin SDK dans le service notification |
| Deep linking | 🟡 Moyenne | Schéma d'URL custom (`afilisten://`) pour les redirections depuis email |
| Biométrie / SSO | 🟢 Basse | Face ID / fingerprint pour le refresh token silencieux |

---

## 8. Architecture Finale Recommandée pour la Production

```
                    ┌────────────────────┐
                    │   CLIENT WEB       │
                    │  (Next.js)         │
                    │  /afi/dashboard    │
                    │  x-school-slug: afi│
                    └─────────┬──────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────▼──────────┐ ┌───────▼──────────┐ ┌──────▼───────────┐
│  CLIENT MOBILE    │ │  INTÉGRATIONS    │ │   POSTMAN / Tests │
│  (React Native)   │ │  TIERCES         │ │                   │
│  x-school-slug:   │ │  x-school-slug:  │ │  x-school-slug:   │
│  afi (stored)     │ │  afi (API key)   │ │  afi (header)     │
└────────┬──────────┘ └───────┬──────────┘ └──────┬───────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │   AFI-LISTEN API    │
                   │  (Express + Prisma) │
                   │                    │
                   │  resolveSchool ──► Lookup DB par slug
                   │  authMiddleware ─► Vérifie JWT + Session
                   │  business logic ─► Isolé par schoolId
                   └──────────┬──────────┘
                              │
                   ┌──────────▼──────────┐
                   │   PostgreSQL        │
                   │   (Supabase)        │
                   │   schoolId isolé    │
                   │   dans chaque table │
                   └─────────────────────┘
```

---

## 9. Recommandations pour l'Équipe Mobile

1. **Stocker le `school_slug`** dans le SecureStore au moment de l'onboarding (1 seule fois)
2. **Injecter systématiquement** `x-school-slug` dans l'intercepteur Axios/Dio
3. **Gérer le refresh automatique** : intercepter les 401 → appeler `/auth/refresh` → retenter
4. **Implémenter le biometric lock** pour les refresh tokens silencieux (meilleure UX)
5. **Tester le `currentSessionId`** : une connexion sur nouvel appareil doit déconnecter l'ancien
