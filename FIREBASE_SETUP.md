# 🔥 Firebase & FCM — Guide de Configuration AFI-LISTEN

> **Version :** 1.0 | **Date :** 2026-04-25
> **Prérequis :** Accès console Firebase + projets `Hack26` et `Dash_hack`

---

## 📋 Étape 1 — Créer le Projet Firebase

1. Aller sur **https://console.firebase.google.com**
2. Se connecter avec le **compte Google de l'organisation AFI**
3. Cliquer sur **"Ajouter un projet"**
4. Nommer le projet : `afi-listen-prod`
5. Activer Google Analytics si souhaité
6. Cliquer **"Créer le projet"** → attendre ~30s

---

## 📋 Étape 2 — Credentials Backend (firebase-admin)

> ⚠️ Cette clé est **secrète**. Ne jamais la committer dans Git.

### Générer la Clé de Service

1. Console Firebase → ⚙️ **Paramètres du projet**
2. Onglet **"Comptes de service"**
3. Section **"Firebase Admin SDK"** → Sélectionner **Node.js**
4. Cliquer **"Générer une nouvelle clé privée"**
5. Télécharger `afi-listen-prod-firebase-adminsdk-xxxxx.json`

---

## 📋 Étape 3 — Variables d'Environnement Backend (Hack26)

Ajouter dans `.env.local` (jamais dans `.env` versionné) :

```bash
# Option A (RECOMMANDÉ — Railway/Render) : JSON complet sur une seule ligne
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"afi-listen-prod","private_key_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\\n...\\n-----END RSA PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-xxxx@afi-listen-prod.iam.gserviceaccount.com",...}

# Option B (Dev local uniquement) : chemin vers le fichier
# FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

> **PowerShell** pour convertir le JSON en une ligne :
> ```powershell
> $json = Get-Content "afi-listen-prod-firebase-adminsdk.json" -Raw
> $json -replace "`r`n","" -replace "`n","\\n" | Set-Clipboard
> ```

### Vérification démarrage

```
[FCM] Firebase Admin SDK initialisé avec succès.   ← OK
[FCM] Firebase désactivé : aucune configuration... ← Variable manquante
```

---

## 📋 Étape 4 — Configuration Web (Next.js — Dash_hack)

### 4.1 Ajouter l'App Web dans Firebase

1. Console Firebase → **"Ajouter une application"** → `</>`
2. Nommer : `afi-listen-web` → Enregistrer
3. Copier la config `firebaseConfig` affichée

### 4.2 Obtenir la VAPID Key

1. ⚙️ Paramètres → **"Cloud Messaging"**
2. Section **"Configuration Web"** → **"Paire de clés Web Push"**
3. Cliquer **"Générer"** → Copier la **clé publique**

### 4.3 Variables d'environnement Dash_hack

```bash
# Dash_hack/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=afi-listen-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=afi-listen-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=afi-listen-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKd7...votre_vapid_key...
```

### 4.4 Installer le SDK

```bash
cd Dash_hack && npm install firebase
```

### 4.5 Service Worker FCM (public/firebase-messaging-sw.js)

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "VOTRE_API_KEY",
  projectId: "afi-listen-prod",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const { url, notificationId } = payload.data || {};
  self.registration.showNotification(title || 'AFI-LISTEN', {
    body: body || '',
    icon: '/icon-192x192.png',
    data: { url, notificationId },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard/notifications';
  event.waitUntil(clients.openWindow(url));
});
```

### 4.6 Lib Firebase (src/lib/firebase.ts)

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export async function requestFcmToken(): Promise<string | null> {
  try {
    if (!await isSupported()) return null;
    const messaging = getMessaging(app);
    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return null;
    }
    return await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
    });
  } catch (err) {
    console.error('[FCM] Token error:', err);
    return null;
  }
}

export async function onForegroundMessage(cb: (payload: any) => void) {
  if (!await isSupported()) return;
  onMessage(getMessaging(app), cb);
}
```

### 4.7 Enregistrer le token après login

```typescript
// Dans votre hook/page après réception du JWT
const fcmToken = await requestFcmToken();
if (fcmToken) {
  await api.post('notifications/fcm-token', { fcmToken });
}
```

---

## 📋 Étape 5 — Configuration Mobile (React Native / Expo)

### 5.1 Ajouter l'App Android

1. Console Firebase → Android
2. Package : `com.afi.listen` (adapter selon projet)
3. Télécharger `google-services.json` → `android/app/`

### 5.2 Ajouter l'App iOS

1. Console Firebase → iOS
2. Bundle ID : `com.afi.listen`
3. Télécharger `GoogleService-Info.plist` → `ios/`

### 5.3 Installation Expo

```bash
npx expo install expo-notifications expo-device
```

`app.json` :
```json
{
  "expo": {
    "plugins": [["expo-notifications", { "color": "#1a1a2e" }]],
    "android": { "googleServicesFile": "./google-services.json" },
    "ios": { "googleServicesFile": "./GoogleService-Info.plist" }
  }
}
```

### 5.4 Hook useFcmToken.ts

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UTI_KEY = 'app_uti';

export async function getOrCreateUti(): Promise<string> {
  let uti = await AsyncStorage.getItem(UTI_KEY);
  if (!uti) {
    uti = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(UTI_KEY, uti);
  }
  return uti;
}

export async function registerFcmToken(api: any): Promise<void> {
  if (!Device.isDevice) return;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const fcmToken = (await Notifications.getExpoPushTokenAsync()).data;
  const uti = await getOrCreateUti();

  // Envoyer au backend — fusionne aussi l'historique invité
  await api.post('notifications/fcm-token', { fcmToken, uti });
}
```

> **Appeler `registerFcmToken(api)` dès que l'utilisateur est loggé.**
> Pour les invités, stocker uniquement l'UTI et le token localement.

---

## 📋 Étape 6 — Nouveaux Endpoints API

| Méthode | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/notifications/fcm-token` | ✅ JWT | Update FCM token + fusion invité |
| `GET` | `/api/notifications/guest?uti=XXX` | ❌ Public | Notifications invité par UTI |
| `GET` | `/api/notifications` | ✅ JWT | Toutes les notifs utilisateur |
| `PATCH` | `/api/notifications/:id/read` | ✅ JWT | Marquer comme lue |
| `POST` | `/api/notifications/broadcast` | ✅ Admin | Broadcast ciblé |
| `DELETE` | `/api/notifications/:id` | ✅ Admin | Supprimer |

---

## 📋 Étape 7 — Flux de Notification Complet

```
Événement (Campagne / Rapport traité / Broadcast)
                  │
    notificationService.create(...)
                  │
        ┌─────────▼─────────┐
        │  Anti-spam (60s)  │  ← bloque les doublons rapides
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │  Persist en DB    │  ← table `notifications` (historique app)
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │  _dispatchPush()  │  ← fire-and-forget (non bloquant)
        └────┬──────┬───────┘
             │      │       │
         userId  targetIds  Broadcast
             │      │       │
          token   tokens   resolve tokens
             │      │       │
        fcmService.send*()
             │
          🔔 Push FCM → Mobile + Web
```

---

## 🔒 Sécurité & Anti-Spam

| Protection | Mécanisme |
|---|---|
| Anti-spam | 1 notif du même type / 60s par clé (userId ou UTI) |
| Tokens invalides | Loggés en `warn`, pas de crash |
| Route `/guest` | Requiert un UTI valide |
| Route `/broadcast` | Roles `ADMIN` ou `MANAGER` uniquement |
| Batch FCM | Max 500 tokens par appel (géré automatiquement) |
| Dégradation | Si Firebase non configuré → notif en DB uniquement |

---

## ❓ FAQ

**Q: Firebase est-il obligatoire pour que les notifications fonctionnent ?**
R: Non. Sans Firebase, les notifications sont créées en base et visibles dans le centre de notifications de l'app. Seul le push immédiat (alerte téléphone) ne fonctionne pas.

**Q: Faut-il utiliser Firebase Auth ?**
R: Non. AFI-LISTEN gère sa propre auth (JWT). Firebase = push FCM uniquement.

**Q: Comment un invité reçoit des push ?**
R: L'app génère un UTI + obtient un FCM token dès le démarrage (sans login). Ce token peut être utilisé directement par le backend pour pusher des notifications liées à un signalement anonyme.

**Q: Que se passe-t-il quand un invité se connecte ?**
R: L'app envoie l'UTI avec le fcmToken au `POST /notifications/fcm-token`. Le backend fusionne automatiquement l'historique : tous les rapports et notifications liés à l'UTI sont rattachés au nouveau compte.
