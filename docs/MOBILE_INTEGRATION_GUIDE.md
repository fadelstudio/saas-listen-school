# Guide d'Implémentation Mobile (Flutter) - Nouvelles Fonctions

Ce guide est destiné à l'équipe Mobile pour l'intégration des annonces et des pièces jointes.

---

## 1. Annonces & Publicités

### Affichage de l'annonce active
Au lancement de l'application ou sur l'écran d'accueil, effectuez un appel à :
`GET /api/v1/announcements/active`

**Format de réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Hackathon 2026",
    "description": "Préparez vos projets...",
    "imageUrl": "https://...",
    "isActive": true
  }
}
```
*Si aucune annonce n'est active, `data` sera `null`.*

### Gestion des Notifications Push
Le backend envoie désormais une notification de type `ANNOUNCEMENT`.
Dans votre `FirebaseMessaging.onMessage` ou `onMessageOpenedApp`, vérifiez le champ `type` :

```dart
if (message.data['type'] == 'ANNOUNCEMENT') {
  // Rediriger vers un dialogue ou un écran d'annonce
  // L'URL de l'image peut être dans message.data['url']
}
```

---

## 2. Signalements avec Pièces Jointes

### Étape 1 : Upload du fichier
Utilisez l'API d'upload générique avant de créer le signalement.
`POST /api/v1/uploads` (Multipart)
- Champ : `file` (le binaire)
- Champ : `folder` = `"reports"` (pour la séparation claire)

**Retour :**
```json
{
  "success": true,
  "data": {
    "url": "https://supabase.../file.jpg",
    "fileName": "uuid.jpg",
    "mimetype": "image/jpeg",
    "size": 123456
  }
}
```

### Étape 2 : Création du Signalement
Incluez les métadonnées reçues dans le champ `attachments`.

```dart
{
  "title": "Fuite d'eau",
  "content": "Bloc B...",
  "type": "PROBLEM_MATERIAL",
  "attachments": [
    {
      "name": "photo.jpg",
      "url": "https://...",
      "type": "image/jpeg",
      "size": 123456
    }
  ]
}
```

### Cas Spécial : Notes Vocales
- **Contrainte** : Limiter l'enregistrement à **1 minute** côté client.
- **Envoi** : Même flux que l'upload classique.
- **Affichage** : Utilisez un lecteur audio pour les fichiers dont le `type` commence par `audio/`.

---

## 3. Historique & Consultation
Les signalements retournés par `GET /api/v1/reports/my-reports` contiennent maintenant la liste des `attachments`. Pensez à les afficher dans le détail du signalement (galerie d'images ou liste de fichiers).
