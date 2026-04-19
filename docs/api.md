# Référence de l'API

L'API AFI-LISTEN est accessible via `/api/v1` (ou `/api`). Tous les endpoints retournent du JSON.

## 🔑 Authentification (`/auth`)

Endpoints pour la gestion des comptes et sessions.

| Méthode | Path | Description | Auth |
|---------|------|-------------|------|
| POST | `/register` | Inscription d'un étudiant | Non |
| POST | `/login` | Connexion (Email/Matricule + Password) | Non |
| POST | `/login/verify-otp` | Vérification code OTP | Non |
| POST | `/login/resend-otp` | Renvoi du code OTP | Non |
| POST | `/forgot-password` | Demande réinitialisation MDP | Non |
| POST | `/reset-password` | Réinitialisation avec token | Non |
| GET | `/me` | Profil chargé (`user` inclut `avatarUrl`, identité optionnelle) | Oui |
| PATCH | `/me` | Mise à jour profil (JSON : prénom, nom, matricule, numero, phone) | Oui |
| POST | `/me/avatar` | Photo de profil — `multipart/form-data`, champ `file` (JPEG/PNG/WebP) | Oui |
| DELETE | `/me/avatar` | Supprime la photo de profil | Oui |
| POST | `/change-password` | Changement de mot de passe | Oui |
| POST | `/refresh` | Rafraîchissement des tokens | Non |
| POST | `/logout` | Déconnexion | Non |

---

## 🚩 Signalements (`/reports`)

Gestion des retours d'insatisfaction ou suggestions.

| Méthode | Path | Description | Auth |
|---------|------|-------------|------|
| POST | `/` | Créer un signalement | Dynamique* |
| GET | `/` | Liste paginée | Oui |
| GET | `/:id` | Détail d'un signalement | Oui |
| PATCH | `/:id` | Modifier un signalement | Oui (Auteur/Admin) |
| PATCH| `/:id/status`| Changer le statut | Oui (Manager+) |
| DELETE| `/:id` | Supprimer | Oui (Admin) |
| POST | `/:id/analyze`| Forcer l'analyse IA | Oui (Manager+) |

*\*L'authentification peut être désactivée globalement pour ce module.*

---

## 🎓 Évaluations (`/evaluations`)

Notes et avis sur les modules et professeurs.

| Méthode | Path | Description | Auth |
|---------|------|-------------|------|
| POST | `/` | Soumettre une notation | Dynamique |
| GET | `/stats` | Moyennes globales | Oui |
| GET | `/` | Liste des notes | Oui |
| GET | `/:id` | Détail | Oui |
| PATCH | `/:id` | Modifier | Oui |
| POST | `/:id/analyze`| Lancer le scoring IA | Oui |

---

## 🧠 Intelligence Artificielle (`/ai`)

Interactions directes avec l'IA et suivi des jobs.

| Méthode | Path | Description | Auth |
|---------|------|-------------|------|
| GET | `/jobs` | Liste des tâches de fond | Oui |
| GET | `/jobs/:id`| Statut d'une tâche | Oui |
| POST| `/jobs/:id/retry`| Relancer un échec | Oui |
| POST| `/chat` | Assistant conversationnel (RAG) | Oui |
| POST| `/synthesis`| Générer un rapport stratégique | Oui |

---

## ⚖️ Décisions (`/decisions`)

Actions correctives prises par l'administration.

| Méthode | Path | Description | Auth |
|---------|------|-------------|------|
| POST | `/` | Créer une décision | Oui (Manager+) |
| GET | `/` | Liste des décisions | Oui |
| GET | `/:id` | Détail | Oui |
| PATCH| `/:id/status`| Changer statut | Oui |

---

## ⚙️ Système & SaaS (`/system`, `/saas`)

Configuration et gestion multi-école.

- `GET /system/settings` : Réglages actuels (IA, Auth, Toggles).
- `PATCH /system/settings` : Mise à jour configuration.
- `GET /saas/schools` : Liste des écoles (SuperAdmin).
- `POST /saas/setup` : Initialisation d'une nouvelle instance.

---

## 📂 Autres Modules

- **Campuses** : `/campuses` (CRUD)
- **Classes** : `/classes` (CRUD)
- **Professors** : `/professors` (CRUD) + `POST/DELETE /professors/:id/avatar` (photo fiche ; réponses avec `avatarUrl`, `campusAccess`, `linkedUserId`)
- **School users** : `/school-users` (création/listes/admin) — réponses avec `avatarUrl`, `campusAccess`, `campusScopeLabel` ; `POST /school-users/:id/reset-password-default`
- **Academic Modules** : `/academic-modules` (CRUD)
- **Levels** : `/levels` (CRUD)
- **Uploads** : `/uploads` (Gestion fichiers)
- **Notifications** : `/notifications` (Suivi temps réel)
