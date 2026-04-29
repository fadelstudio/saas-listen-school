# 📱 Guide Master d'Intégration Mobile - AFI-LISTEN

Ce document est le guide de référence ultime pour le développement de l'application mobile AFI-LISTEN. Il détaille l'intégralité des fonctionnalités, des flux UX/UI et des spécifications techniques pour garantir une application légère, rapide et stable.

---

## 1. 🌍 Fondations & Connectivité

### Configuration Réseau
- **Base URL (Production) :** `https://afi-listen-api.up.railway.app/api`
- **Header École :** `x-school-slug: afi` (OBLIGATOIRE sur tous les appels).
- **Header Auth :** `Authorization: Bearer <JWT_TOKEN>` (Obtenu après Login/Register).

### Stratégie de Performance (Légèreté & Vitesse)
Pour une application ultra-réactive :
1. **Appels Centralisés :** Utilisez un dossier `services/api.ts` avec une instance Axios configurée avec les intercepteurs pour les headers et la gestion automatique du 401.
2. **Hooks de Données :** Utilisez React Query ou SWR pour le caching automatique.
3. **Lazy Loading :** Ne chargez que les données nécessaires à l'écran actuel.

---

## 2. 🛣 Flux de Navigation UX/UI

### Phase 1 : Boot & Onboarding
1. **Splash Screen :** Affiche le logo de l'école + Appel `GET /api/system/public` pour vérifier si l'IA est activée et si l'auth est obligatoire.
2. **Onboarding (3 Slides) :**
   - *Slide 1 :* Présentation de la plateforme.
   - *Slide 2 :* Signalements anonymes et sécurité.
   - *Slide 3 :* Évaluations et Assistant MyIA.
3. **Portail d'Entrée :**
   - **Connexion :** Email / Matricule + Password.
   - **Inscription :** Formulaire incluant Email, Password, Prénom, Nom, et **Choix de la Classe** (via `classId`).
     - L'app doit d'abord appeler `GET /api/system/public/form-data` pour récupérer la liste des classes.
   - **Bouton "Continuer en mode invité"** (Accès limité aux signalements).

---

## 3. 👤 Identité & UTI (Unique Tracking Identifier)

L'UTI est la clé de voûte du mode anonyme.
- **Génération :** Créez un UUID unique au premier lancement (ex: `device_8472...`).
- **Stockage :** Stockez-le dans `AsyncStorage` (ne change jamais meme apres unistall gere sur appl/androit).
- **Fusion :** Lors du login/register, envoyez l'UTI au backend pour rattacher l'historique anonyme au nouveau compte.

---

## 3.5 📝 Module : Inscription (Register)

### Inscription d'un étudiant
- **Endpoint :** `POST /api/auth/register`
- **Body :**
  ```json
  {
    "email": "etudiant@afi.com",
    "password": "monMdpSecret123",
    "firstName": "Mamadou",
    "lastName": "Niane",
    "classId": "uuid-de-la-classe",
    "campusId": "uuid-optionnel"
  }
  ```
- **Note :** Si `classId` est fourni, le backend rattachera automatiquement l'étudiant au bon campus.

---

## 4. 📝 Module : Signalements & Suggestions

### Soumission (Mode Invité ou Connecté)
- **Endpoint :** `POST /api/reports`
- **Body :**
  ```json
  {
    "title": "Problème clim salle 302",
    "content": "La climatisation fuit et fait beaucoup de bruit.",
    "type": "PROBLEM_MATERIAL",
    "priority": "MEDIUM",
    "classId": "uuid-optionnel",
    "professorId": "uuid-optionnel",
    "moduleId": "uuid-optionnel",
    "isAnonymous": true,
    "uti": "votre-uti-local"
  }
  ```
- **Flux :** Soumission -> Confirmation -> Notification push lors du traitement par l'admin.

---

## 5. 🎓 Module : Évaluations via Campagnes

Les évaluations ne se font pas dans le vide : elles sont liées à des **Campagnes actives**.

### Flux d'Évaluation
1. **Récupérer les Campagnes :** `GET /api/evaluation-campaigns` (filtré par votre `classId` vue que user connecté).
2. **Filtrage :** L'app affiche les campagnes "OUVERTES" pour les modules suivis par l'étudiant.
3. **Soumission :** `POST /api/evaluations`
   - **Body :**
     ```json
     {
       "campaignId": "uuid-campagne",
       "professorId": "uuid-prof",
       "moduleId": "uuid-module",
       "classId": "uuid-classe",
       "comprehensionRating": "GOOD",
       "explanationRating": "EXCELLENT",
       "pedagogyRating": "FAIR",
       "availabilityRating": "GOOD",
       "rhythmRating": "GOOD",
       "comment": "Explications très claires.",
       "isAnonymous": false,
       "uti": "votre-uti-local"
     }
     ```

### Historique des Évaluations (Dashboard Étudiant)
L'app doit afficher trois sections :
- **En cours :** Campagnes actives non encore évaluées par l'étudiant.
- **Évaluées :** Liste des campagnes déjà complétées (Historique).
- **Clôturées :** Campagnes passées (Archive).

---

## 🤖 6. Assistant IA MyIA (Chatbot)

Le chatbot est intégré pour aider à formuler les signalements ou répondre aux questions.
- **Endpoint :** `POST /api/ai/chat`
- **Structure Action JSON :**
  Si l'IA propose une action, elle inclut ce bloc dans sa réponse textuelle :
  ```json_action
  {
    "type": "CREATE_REPORT",
    "payload": {
      "title": "Signalement suggéré",
      "content": "...",
      "type": "..."
    }
  }
  ```
- **UX Mobile :** Détectez le tag `json_action`, affichez une carte "Aperçu" avec boutons [Annuler] / [Modifier] / [Valider].

---

## 🔥 7. Configuration Firebase & Push

### Setup FCM
1. **Android :** Placez `google-services.json` dans `android/app/`.
2. **iOS :** Placez `GoogleService-Info.plist` dans le projet iOS.
3. **Expo :** Utilisez `expo-notifications`.

### Enregistrement du Token
Appelez systématiquement cet endpoint au démarrage et après login :
- **Endpoint :** `POST /api/notifications/fcm-token`
- **Body :**
  ```json
  {
    "fcmToken": "votre-token-fcm-firebase",
    "uti": "votre-uti-local"
  }
  ```

---

## 📦 8. Modèles de Données Complets (API Reference)

### Modèle `Report` (Signalement)
```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "status": "SUBMITTED | REVIEWED | APPROVED | REJECTED",
  "type": "PROBLEM_MATERIAL | PROBLEM_ADMIN | PROBLEM_PEDAGOGICAL | INCIDENT | SUGGESTION | OTHER",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "createdAt": "ISO8601",
  "author": { "id": "uuid", "firstName": "...", "lastName": "..." } // null si anonyme
}
```

### Modèle `EvaluationCampaign`
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "DRAFT | ACTIVE | CLOSED",
  "dueDate": "ISO8601",
  "module": { "id": "uuid", "name": "string" },
  "professor": { "id": "uuid", "firstName": "...", "lastName": "..." }
}
```

---

## 💡 Architecture Mobile Recommandée (Légèreté)

### Structure des fichiers
```text
/src
  /api          # Instance Axios & Intercepteurs
  /hooks        # useAuth, useReports, useCampaigns (React Query)
  /services     # Fonctions d'appel API par module
  /components   # UI réutilisable (Design unifié)
  /screens
    /Guest      # Signalement rapide
    /Auth       # Login / Register
    /Student    # Dashboard, History, ChatMyIA
```

### Unification du Design
Utilisez un thème central (`theme.ts`) avec les couleurs de l'école (Bordeaux/Blanc)  avec mode dark/light pour que l'app soit consistante sur toutes les pages.
- **Couleur Primaire :** `#800020` (Burgundy)
- **Couleur Secondaire :** `#F5F5F5` (Light Gray)
