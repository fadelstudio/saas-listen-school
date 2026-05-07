# Référence de l'API

L'API AFI-LISTEN est accessible via `/api/v1` (ou `/api`). Tous les endpoints retournent du JSON.

## Scope & Sécurité multi-campus

- Toutes les routes de lecture dashboard sont filtrées par `schoolId` + scope utilisateur.
- Rôles `ADMIN`/`MANAGER`/`VIEWER` avec `campusIds` attachés: données limitées à ces campus.
- `STUDENT`: filtrage renforcé par `classId`/campagnes actives.
- `VIEWER`: lecture seule (aucune action d'écriture).
- En production, les liens d'email (reset/OTP) utilisent `PUBLIC_APP_URL` public (pas de `localhost`).

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

Notes OTP/email:
- OTP standard: envoi email (SMTP/Resend selon config).
- Fallback OTP: activable via `OTP_FALLBACK_ENABLED=true` + `OTP_FALLBACK_CODE=XXXXXX`, utilisable uniquement sur challenge OTP déjà ouvert.
- SMTP Ethereal: si l'envoi réussit, une URL de preview est loggée côté serveur (`[mail:smtp:preview]`).

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

---

## 📈 Analytics (`/analytics`)

Données agrégées pour le pilotage.

| Méthode | Path | Description | Auth |
|---------|------|-------------|------|
| GET | `/dashboard` | Compteurs et distributions (Manager+) | Oui |
| GET | `/time-series` | Stats temporelles (Soumis, En cours, Résolus) | Oui |
| POST | `/global-analysis` | Générer un rapport d'analyse IA | Oui |
| GET | `/reports` | Liste des rapports d'analyse générés | Oui |
| GET | `/reports/:id` | Détail d'un rapport et décisions suggérées | Oui |

---

## 🔍 Audit & Traçabilité (`/audit`)

Logs d'audit système pour les administrateurs.

| Méthode | Path | Description | Auth |
|---------|------|-------------|------|
| GET | `/logs` | Liste paginée des actions système | Admin+ |

---

## 📂 Autres Modules

- **Campuses** : `/campuses` (CRUD)
- **Classes** : `/classes` (CRUD)
- **Professors** : `/professors` (CRUD) + `POST/DELETE /professors/:id/avatar`
- **School users** : `/school-users` (création/listes/admin)
- **Academic Modules** : `/academic-modules` (CRUD)
- **Levels** : `/levels` (CRUD)
- **Uploads** : `/uploads` (Gestion fichiers)
- **Notifications** : `/notifications` (Suivi temps réel)
- **Bulk Import** : `/bulk-import` (Import Excel/CSV)
