# AFI-LISTEN API Reference

Cette documentation détaille les endpoints du backend AFI-LISTEN.

## Base URL

Les routes sont disponibles sous deux préfixes (compatibilité) :

- `/api` (recommandé)
- `/api/v1` (alias)

Toutes les requêtes (sauf mention contraire) attendent un en-tête `Authorization: Bearer <token>`.

## Format de réponse (standard)

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

## 🛡️ Rôles & Permissions

- **SUPERADMIN** : (SaaS) Création d’une nouvelle école + attribution du premier ADMIN.
- **ADMIN** : Accès total sur l’école courante. Réglages système, suppressions.
- **MANAGER** : Gestion académique. Consultation/traitement.
- **AGENT** : Accès opérationnel (selon routes).
- **VIEWER** : Lecture seule.
- **STUDENT** : Soumission de signalements/évaluations (selon réglage d’auth).

---

## ⚙️ Configuration Système

### GET `/api/system`
Récupère les paramètres globaux (nom de l'école, mode d'authentification, IA).
- **Rôle requis** : ADMIN

### PATCH `/api/system`
Met à jour les réglages système.
- **Rôle requis** : ADMIN
- **Corps de requête** :
  - `schoolName` (string)
  - `authReportsRequired` (boolean) : Si vrai, l'auth est obligatoire pour `/reports`.
  - `authEvaluationsRequired` (boolean) : Si vrai, l'auth est obligatoire pour `/evaluations`.
  - `aiEnabled` (boolean)

---

## 🏫 Modules Académiques

### Campuses
- **GET `/api/campuses`** : Liste paginée (Filtre: `search`).
- **POST `/api/campuses`** : Créer un campus (Admin/Manager).
- **PATCH `/api/campuses/:id`** : Modifier un campus (Admin/Manager).
- **DELETE `/api/campuses/:id`** : Supprimer un campus (Admin).

### Classes
- **GET `/api/classes`** : Liste paginée (Filtre: `campusId`, `search`).
- **POST `/api/classes`** : Créer une classe (Admin/Manager).
- **PATCH `/api/classes/:id`** : Modifier une classe (Admin/Manager).

### Professors
- **GET `/api/professors`** : Liste paginée.
- **POST `/api/professors`** : Créer un professeur (Admin/Manager).
- **PATCH `/api/professors/:id`** : Modifier un professeur (Admin/Manager).

---

## 📝 Signalements & Évaluations

### Signalements (Reports)
- **POST `/api/reports`** : Soumission d'un signalement.
  - **Auth** : Facultatif (Sauf si `authReportsRequired` est activé).
  - **Champs** : `title`, `content`, `type`, `classId` (optional), `professorId` (optional).
- **GET `/api/reports`** : Liste paginée (Filtres: `status`, `professorId`, `classId`, etc.).
- **PATCH `/api/reports/:id/status`** : Changer le statut (Admin/Manager).

### Évaluations
- **POST `/api/evaluations`** : Soumission d'une évaluation anonyme ou non.
  - **Champs** : `professorId`, `moduleId`, `classId`, `score`, `comment`, `isAnonymous`.
- **GET `/api/evaluations/stats`** : Récupère les moyennes agrégées par prof/matière.

---

## 🤖 IA & Décisions

### Decisions
- **POST `/api/decisions`** : Acter une décision suite à une évaluation.
  - **Rôle requis** : ADMIN/MANAGER.
- **GET `/api/decisions/:id`** : Voir le détail (incluant les suggestions IA).

### AI Analysis
- **POST `/api/reports/:id/analyze`** : Forcer une analyse IA sur un signalement.
- **POST `/api/evaluations/:id/analyze`** : Forcer une notation IA sur une évaluation.

---

## 📎 Uploads

### POST `/api/uploads`
Upload d’un fichier (pièce jointe) vers Supabase Storage.

- **Auth** : Oui
- **Bucket** : `attachments` (privé)
- **Réponse** : URL signée (`SIGNED_URL_EXPIRES_IN`)
