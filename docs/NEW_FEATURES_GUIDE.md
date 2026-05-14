# Guide d'Intégration : Nouvelles Fonctionnalités (Annonces & Pièces Jointes)

Ce document décrit comment intégrer les nouvelles fonctionnalités du backend (Annonces et Pièces jointes aux signalements) dans les clients Web et Mobile.

---

## 1. Annonces (Partie Pub)

Le module `Announcements` permet d'afficher des bannières publicitaires ou des annonces importantes gérées par l'administration.

### Modèle de données
| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Identifiant unique |
| `title` | String | **Obligatoire**. Titre de l'annonce. |
| `description` | String | Description détaillée (facultatif). |
| `imageUrl` | String | URL de l'image (facultatif). |
| `startDate` | DateTime | Date de début (défaut: maintenant). |
| `endDate` | DateTime | Date de fin (facultatif). |
| `isActive` | Boolean | **Une seule annonce active à la fois**. |

### Endpoints
- **Public (Affichage Front)** : `GET /api/v1/announcements/active`
    - Retourne l'annonce actuellement active pour l'école résolue par le tenant.
- **Admin (Gestion)** :
    - `GET /api/v1/announcements` : Liste toutes les annonces.
    - `POST /api/v1/announcements` : Créer une annonce.
    - `PATCH /api/v1/announcements/:id` : Modifier une annonce. (Activer une annonce désactive automatiquement les autres).
    - `DELETE /api/v1/announcements/:id` : Supprimer.

### Notifications
Lorsqu'une annonce est activée, une notification de type `ANNOUNCEMENT` est envoyée en broadcast à tous les utilisateurs.

---

## 2. Pièces Jointes aux Signalements

Les signalements (`Report`) supportent désormais des pièces jointes de nature variée.

### Flux de travail (Workflow)
1.  **Upload** : Envoyer le fichier sur `POST /api/v1/uploads` (multipart/form-data).
    - Passer `folder="reports"` dans le body pour une séparation claire.
    - Récupérer l'objet de réponse : `{ "url": "...", "name": "...", "type": "...", "size": 1234 }`.
2.  **Création du Signalement** : Envoyer le signalement sur `POST /api/v1/reports` en incluant le tableau `attachments`.

### Format JSON `attachments`
```json
{
  "title": "Problème clim",
  "content": "La clim fuit...",
  "type": "PROBLEM_MATERIAL",
  "attachments": [
    {
      "name": "photo_fuite.jpg",
      "url": "https://supabase.../photo_fuite.jpg",
      "type": "image/jpeg",
      "size": 1048576
    },
    {
      "name": "vocal_explication.wav",
      "url": "https://supabase.../vocal_explication.wav",
      "type": "audio/wav",
      "duration": 45
    }
  ]
}
```

### Limites à respecter côté Front
- **Taille** : Vérifier la limite `MAX_FILE_SIZE_MB` (généralement 10MB).
- **Audio (Vocal)** : Limiter l'enregistrement à **1 minute maximum**.
- **Types supportés** : Images (JPEG, PNG, WebP), Audio (WAV, MP3, WebM), Documents (PDF).

---

## 3. Mise à jour des Réponses API
Les signalements retournés par `GET /api/v1/reports`, `GET /api/v1/reports/:id` et `GET /api/v1/reports/my-reports` contiennent désormais le champ `attachments` (JSON).

Exemple de réponse :
```json
{
  "id": "...",
  "title": "...",
  "attachments": [ ... ],
  "status": "SUBMITTED",
  ...
}
```
