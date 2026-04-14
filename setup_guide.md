# Guide de Configuration AFI-LISTEN

Ce document récapitule les étapes nécessaires pour rendre opérationnels l'envoi d'emails et les notifications push (FCM).

## 1. Emails & OTP (Resend)

L'application utilise [Resend](https://resend.com) pour l'envoi des emails transactionnels (OTP, Réinitialisation de mot de passe).

### Étapes :
1.  **Créer un compte** sur [Resend.com](https://resend.com).
2.  **Générer une API Key**.
3.  **Vérifier votre domaine** (optionnel pour les tests, obligatoire pour la production).
4.  **Mettre à jour le fichier `.env`** :
    ```env
    RESEND_API_KEY=re_your_api_key
    EMAIL_FROM="AFI-LISTEN <noreply@votre-domaine.com>"
    ```

> [!NOTE]
> Si `RESEND_API_KEY` n'est pas configuré, les emails seront simplement affichés dans les logs de la console (mode développement).

---

## 2. Notifications Push (FCM)

Le backend est préparé pour stocker les tokens FCM (`fcmToken` ajouté au modèle User). Pour envoyer des notifications réelles, suivez ces étapes :

### Étapes :
1.  **Créer un projet** sur la [Console Firebase](https://console.firebase.google.com/).
2.  **Activer Cloud Messaging**.
3.  **Générer une clé de compte de service** (Fichier JSON) dans Paramètres du projet > Comptes de service.
4.  **Installation des dépendances** (si vous souhaitez implémenter l'envoi immédiat) :
    ```bash
    npm install firebase-admin
    ```
5.  **Configuration Environnement** :
    Ajoutez le chemin vers votre fichier JSON ou les variables correspondantes dans le `.env`.

### Implémentation suggérée (Service FCM) :
Un service typique chargerait la clé et utiliserait `admin.messaging().sendToDevice(token, payload)`.

---

## 3. Configuration de l'OTP

Vous pouvez contrôler l'obligation de l'OTP pour l'inscription initiale via deux canaux :

1.  **Global (.env)** : `LOGIN_OTP_ENABLED=true` (Force l'OTP partout).
2.  **Tableau de bord (Admin)** : Champ `authOtpRequired` dans `SystemSettings`.

### Flux cohérent configuré :
- **Register** : Demande un OTP si activé (vérifie l'email).
- **Login** : Accès direct par Matricule/Email + Mot de passe (pas d'OTP).
- **Sécurité** : 5 tentatives max pour l'OTP d'inscription, sinon le compte est bloqué.
