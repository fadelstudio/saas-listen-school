# API REST — Authentification Google (campus / classe) + compatibilité login classique

Ce document décrit **ce que le backend attend et renvoie** pour la fonctionnalité **Google Sign-In** (étudiants), le choix **campus + classe**, et la relation avec **l’inscription / login existants**. Il est destiné aux développeurs **Web**, **Android (APK)** et **iOS**, ainsi qu’à la configuration **serveur**.

---

## 1. Le login / register actuels ne sont pas cassés


| Flux                                                                  | Route                                            | Statut       |
| --------------------------------------------------------------------- | ------------------------------------------------ | ------------ |
| Connexion email ou matricule + mot de passe                           | `POST /api/auth/login` (ou `/api/v1/auth/login`) | **Inchangé** |
| Inscription email + mot de passe + `classId` (+ `campusId` optionnel) | `POST /api/auth/register`                        | **Inchangé** |
| OTP inscription, refresh, forgot password, etc.                       | Routes existantes                                | **Inchangé** |


Les comptes **uniquement Google** ont `passwordHash` nul : le backend **refuse** `POST /api/auth/login` avec mot de passe pour ces comptes (message du type : utiliser le bouton Google). Les comptes **email + mot de passe** continuent de se connecter comme avant.

---

## 2. Préfixe d’URL et contexte école (toutes plateformes)

Les routes d’auth sont exposées sous :

- `https://<hôte>/api/auth/...`
- **équivalent** : `https://<hôte>/api/v1/auth/...`

En **mode tenant strict** (production typique), chaque requête doit permettre de résoudre l’école :

- **Sous-domaine** dédié (ex. `ecole.app.com`), et/ou  
- Header `**x-school-slug: <slug>`** (valeur `schools.slug`, ex. `afi`).

En **mode non strict** (dev), peuvent aussi fonctionner `/<slug>/api/...` et un repli `DEFAULT_SCHOOL_SLUG` — voir `docs/INTEGRATION_GUIDE.md`.

**Web / APK / iOS** : pour `/auth/google` et `/auth/google/complete`, utiliser **exactement les mêmes règles** que pour `/auth/login` et `/auth/register` (même base URL, mêmes headers tenant).

---

## 3. Format de réponse HTTP standard (succès)

Toutes les réponses JSON succès suivent le même enveloppe que le reste de l’API :

```json
{
  "success": true,
  "message": "string",
  "data": { },
  "error": null
}
```

Le **corps métier** est dans `**data`**. Les exemples ci-dessous montrent le contenu typique de `**data**`.

En cas d’erreur : `success: false`, `data: null`, `error` éventuellement renseigné, code HTTP 4xx/5xx.

---

## 4. Inscription classique (rappel — campus / classe)

`**POST /api/auth/register**`


| Champ                   | Obligatoire | Description                                                      |
| ----------------------- | ----------- | ---------------------------------------------------------------- |
| `email`                 | oui         |                                                                  |
| `password`              | oui         | Règles Zod côté serveur (longueur, majuscule, chiffre)           |
| `firstName`, `lastName` | oui         |                                                                  |
| `classId`               | **oui**     | UUID de la classe                                                |
| `campusId`              | non         | Si absent, le serveur **déduit** le campus à partir de `classId` |


Réponse possible : soit `{ token, refreshToken, user }`, soit `{ step: "REGISTER_OTP_REQUIRED", challengeId, expiresInSeconds }` selon la config école (`LOGIN_OTP_ENABLED` / `system_settings.authOtpRequired`).

---

## 5. Connexion classique (rappel)

`**POST /api/auth/login`**

```json
{ "email": "etudiant@ecole.sn", "password": "..." }
```

ou `{ "matricule": "...", "password": "..." }` pour le staff selon le contrat existant.

Réponse : `{ "token", "refreshToken", "user" }` dans `data` (JWT d’accès + refresh).

---

## 6. Google — étape 1 : vérifier le jeton et obtenir soit la session, soit l’étape « choix classe »

`**POST /api/auth/google**`

### Headers

- `Content-Type: application/json`
- `**x-school-slug: <slug>**` si le tenant n’est pas déduit uniquement par le domaine (même usage que login/register).

### Corps JSON


| Champ     | Type   | Obligatoire | Description                                                                                                                                                                                                                                     |
| --------- | ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `idToken` | string | **oui**     | `**id_token`** JWT retourné par **Google Sign-In** (Web : Credential / GIS ; Android : résultat du client Google ; iOS : SDK Google). Ce jeton est **à envoyer uniquement au backend** (HTTPS), pas à stocker en clair côté client après usage. |


### Comportement côté serveur (résumé)

1. Vérifie la signature et l’audience du `idToken` avec les **Client IDs** configurés en variable d’environnement `**GOOGLE_OAUTH_CLIENT_IDS`** (voir section 10).
2. Exige que l’email Google soit **vérifié** (`email_verified` dans le jeton).
3. Si un utilisateur avec le même `**googleId`** (`sub` Google) existe pour **cette école** et a déjà une **classe** (étudiant) ou n’est pas un cas « étudiant sans classe » → **login direct** : tokens + `user`.
4. Si nouvel utilisateur (email libre dans le contexte) ou étudiant Google sans classe → `**GOOGLE_SELECT_CLASS`** + `pendingToken` (durée de vie **15 minutes**).
5. Si l’email existe déjà avec **mot de passe** et sans lien Google → **409 Conflict** (inciter à se connecter au mot de passe).

### Exemple de requête (cURL)

```bash
curl -sS -X POST "https://api.example.com/api/auth/google" \
  -H "Content-Type: application/json" \
  -H "x-school-slug: afi" \
  -d '{"idToken":"eyJhbGciOiJSUzI1NiIs..."}'
```

### Exemples de `data` en réponse

**A) Connexion directe (compte déjà complet)**

```json
{
  "token": "<access JWT>",
  "refreshToken": "<refresh opaque>",
  "user": {
    "id": "...",
    "email": "...",
    "hasPassword": true,
    "firstName": "...",
    "lastName": "...",
    "role": "STUDENT",
    "classId": "...",
    "campusIds": ["..."],
    "schoolId": "...",
    "emailVerified": true,
    "avatarUrl": null
  }
}
```

`hasPassword` est `false` pour un compte **exclusivement Google**.

**B) Besoin de choisir campus + classe avant de créer / finaliser le compte**

```json
{
  "step": "GOOGLE_SELECT_CLASS",
  "pendingToken": "<JWT court signé par le serveur>",
  "expiresInSeconds": 900
}
```

Le front **ne parse pas** ce `pendingToken` : il le renvoie tel quel à l’étape 2 après le choix utilisateur.

**C) Après étape 2, si l’école impose un OTP à l’inscription** (même logique que `POST /register`)

```json
{
  "step": "REGISTER_OTP_REQUIRED",
  "challengeId": "<uuid>",
  "expiresInSeconds": 600
}
```

Ensuite : `**POST /api/auth/register/verify-otp**` avec `{ "challengeId", "otp" }` (identique au flux register classique).

---

## 7. Google — étape 2 : campus / classe puis création de compte ou complétion

`**POST /api/auth/google/complete**`

### Headers

- `Content-Type: application/json`
- `**x-school-slug**` : même contexte école que l’étape 1.

### Corps JSON


| Champ          | Type                 | Obligatoire | Description                                                                                                                        |
| -------------- | -------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pendingToken` | string               | **oui**     | Valeur reçue à l’étape 1 (`GOOGLE_SELECT_CLASS`).                                                                                  |
| `classId`      | string (UUID)        | **oui**     | Classe dans l’école courante.                                                                                                      |
| `campusId`     | string (UUID) | null | non         | Optionnel. Si fourni, doit être le **campus de la classe** (sinon erreur 400). Si omis, le serveur utilise le campus de la classe. |


### Exemple de requête

```bash
curl -sS -X POST "https://api.example.com/api/auth/google/complete" \
  -H "Content-Type: application/json" \
  -H "x-school-slug: afi" \
  -d '{
    "pendingToken": "<jwt>",
    "classId": "00000000-0000-4000-8000-000000000002",
    "campusId": "00000000-0000-4000-8000-000000000001"
  }'
```

### Réponses `data` possibles

- **Login complet** : `{ "token", "refreshToken", "user" }` (HTTP 200).  
- **OTP requis** : `{ "step": "REGISTER_OTP_REQUIRED", "challengeId", "expiresInSeconds" }` (HTTP **201** dans l’implémentation actuelle, aligné sur le register).  
- Erreurs fréquentes : **401** (jeton Google ou `pendingToken` invalide/expiré), **400** (classe hors école ou campus incohérent), **409** (email créé entre-temps).

---

## 8. Liste des classes / campus (hors scope auth)

Le backend ne renvoie pas la liste des classes dans les routes Google. Le front doit réutiliser les **endpoints métier déjà utilisés** pour l’inscription classique (ex. listes campus / classes par école — voir `docs/INTEGRATION_GUIDE.md` et les routes `campuses`, `classes`, etc. selon votre version du projet).

Ordre UX recommandé :

1. Chargement des campus de l’école (si besoin).
2. Chargement des classes (filtrées par campus si l’UI est en deux étapes).
3. L’utilisateur choisit une **classe** ; `classId` est obligatoire ; `campusId` peut être omis si une seule étape « classe seule » suffit.

---

## 9. Changement de mot de passe (compte Google-only)

`**POST /api/auth/change-password`** (utilisateur connecté)

- Si `**hasPassword: false**` : `currentPassword` peut être **omis** ; le corps définit le **premier** mot de passe local.  
- Si `**hasPassword: true`** : `currentPassword` **requis** et vérifié comme avant.

---

## 10. Configuration des environnements

### 10.1 Backend (obligatoire pour activer Google)

Fichiers typiques : `.env`, `.env.local`, variables sur **Render / Railway / Docker**, etc.


| Variable                                                | Obligatoire pour Google                    | Description                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `**GOOGLE_OAUTH_CLIENT_IDS`**                           | **Oui** pour que `/auth/google` fonctionne | Liste des **OAuth 2.0 Client ID** Google autorisés comme `**aud`** du `id_token`, **séparés par des virgules** sans espace superflu (ex. `WEB_CLIENT_ID.apps.googleusercontent.com,ANDROID_CLIENT_ID.apps.googleusercontent.com`). **Chaque application** (site Web, APK, iOS) qui envoie un `id_token` doit utiliser un Client ID **présent dans cette liste**. |
| `**JWT_SECRET`**                                        | Déjà requis                                | Signe les JWT d’accès et le `**pendingToken**` (étape Google).                                                                                                                                                                                                                                                                                                   |
| `LOGIN_OTP_ENABLED` / `system_settings.authOtpRequired` | Déjà existant                              | Si activé, après `google/complete` le flux OTP est le **même** que pour `register`.                                                                                                                                                                                                                                                                              |


Si `**GOOGLE_OAUTH_CLIENT_IDS`** est absent ou vide : `POST /api/auth/google` renvoie une erreur **400** explicite (« Google sign-in is not configured ») — **sans impact** sur `/login` ni `/register`.

### 10.2 Migrations base de données

Après déploiement du code contenant le schéma Prisma mis à jour :

```bash
npx prisma migrate deploy
```

(ou `npm run prisma:migrate` en développement.)

Sans migration, les colonnes `googleId` / `passwordHash` nullable peuvent manquer.

### 10.3 Application Web (Google Cloud Console + front)

1. **Google Cloud Console** → APIs & Services → **Credentials** → **Create credentials** → **OAuth client ID**.
2. Type **Web application** pour le front navigateur :
  - **Authorized JavaScript origins** : origines du site (ex. `https://app.ecole.sn`, `http://localhost:3001`).  
  - **Authorized redirect URIs** : selon le flux (ex. redirect implicit / code flow si utilisé par votre lib).
3. Le **Client ID** (format `….apps.googleusercontent.com`) doit être :
  - celui utilisé par **Google Identity Services** / votre lib côté front pour obtenir le `**id_token`** ;  
  - **répété** côté backend dans `**GOOGLE_OAUTH_CLIENT_IDS`**.

Variables côté **front** (exemples, noms à adapter au projet) :


| Exemple de variable front      | Usage                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID Web affiché au SDK Google (non secret mais doit matcher le backend). |
| `NEXT_PUBLIC_API_URL`          | URL de base de l’API pour `POST .../auth/google`.                              |


**Important** : le **Client Secret** Web ne sert **pas** à valider le `id_token` côté serveur dans ce flux ; le backend utilise `**google-auth-library`** avec la liste de **Client IDs** (audiences). Ne pas envoyer le Client Secret au mobile dans l’APK.

### 10.4 Android (APK)

1. Même projet Google Cloud ; créer un **OAuth client ID** de type **Android** avec le **nom du package** et l’empreinte **SHA-1** (debug + release).
2. Ajouter ce Client ID dans `**GOOGLE_OAUTH_CLIENT_IDS`** sur le backend (souvent **en plus** du Client ID Web, séparé par une virgule).
3. Fichiers habituels : `google-services.json` (Firebase / Google Services), configuration du **Google Sign-In** SDK ; récupérer le `**idToken`** après connexion et l’envoyer au backend.

### 10.5 iOS

1. Créer un **OAuth client ID** de type **iOS** avec le **Bundle ID**.
2. L’ajouter à `**GOOGLE_OAUTH_CLIENT_IDS`**.
3. Utiliser le SDK Google Sign-In / GID ; envoyer le `**id_token**` au même endpoint que Web/Android.

---

## 11. Table des erreurs HTTP utiles (Google)


| HTTP      | Cas typique                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------- |
| 400       | Google non configuré ; email Google non vérifié ; classe / campus invalides.                      |
| 401       | `idToken` Google invalide ou expiré ; `pendingToken` invalide ou expiré ; mauvais contexte école. |
| 403 / 401 | Compte désactivé, email non vérifié (selon cas).                                                  |
| 409       | Email déjà utilisé avec mot de passe (connexion classique).                                       |
| 200 / 201 | Succès (voir corps `data`).                                                                       |


Les messages exacts peuvent évoluer ; se fier au couple **HTTP + `message` / `error`**.

---

## 12. Checklist intégration (Web / APK / iOS)

- Même **base URL** API et mêmes headers **tenant** que pour login/register.  
- Obtenir un `**id_token`** frais (durée de vie courte) et l’envoyer immédiatement à `**POST /auth/google**`.  
- Si `step === "GOOGLE_SELECT_CLASS"` : écran choix **classe** (et campus si UX en deux listes), puis `**POST /auth/google/complete`**.  
- Si `step === "REGISTER_OTP_REQUIRED"` : écran OTP + `**POST /auth/register/verify-otp**`.  
- Stocker `**token**` + `**refreshToken**` comme pour le login classique ; header `**Authorization: Bearer <token>**` pour les routes protégées.  
- Afficher le bouton Google seulement si le backend est configuré (`GOOGLE_OAUTH_CLIENT_IDS`) — optionnellement exposer un flag public dans une route `system/public` dans une évolution future.  
- Comptes Google-only : ne pas proposer uniquement le formulaire email/mot de passe sans bouton Google (sinon message d’erreur login).

---

## 13. Références code

- Routes : `src/modules/auth/auth.route.ts`  
- Schémas : `src/modules/auth/auth.schema.ts` (`googleAuthStartSchema`, `googleAuthCompleteSchema`)  
- Logique : `src/modules/auth/auth.service.ts`, `src/modules/auth/google-id-token.ts`  
- Variables d’environnement : `src/core/config/env.ts`

Guide général front/back : `docs/INTEGRATION_GUIDE.md` (point **3bis** Google).