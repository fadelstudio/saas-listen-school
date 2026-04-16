Donc pas FCM / push (pour l’instant)
FCM = push notifications mobile (Android/iOS) → pas intégré ici.
Si tu veux du push plus tard, tu gardes cette table comme source-of-truth, et tu ajoutes un “dispatcher” (worker) qui envoie via FCM/email/SMS selon channel, puis marque deliveredAt, etc.



le projet actuel coter backen / Voici une **fiche technique claire, structurée et défendable** pour ton backend — utilisable directement en soutenance 👇

---

# 📄 **FICHE TECHNIQUE — BACKEND AFI-LISTEN IA**

## 🎯 **Objectif du backend**

Backend centralisé permettant de :

* Collecter des signalements et évaluations (texte, audio, image)
* Analyser automatiquement via IA
* Structurer les données pour le dashboard décisionnel
* Gérer la scalabilité et la performance (files d’attente, cache)

---

# 🧱 **ARCHITECTURE GLOBALE**

```text
Client (Mobile / Web)
        ↓
API REST (Node.js)
        ↓
Queue (Redis + BullMQ)
        ↓
Worker IA (Traitement asynchrone)
        ↓
Base de données (PostgreSQL / Supabase)
```

👉 Architecture **asynchrone et scalable** (non bloquante)

---

# ⚙️ **STACK TECHNIQUE**

## 🧠 Backend Core

* **Node.js + Express + TypeScript**

  * API REST robuste et typée
  * Structure modulaire (controllers, services, routes)

---

## 🗄️ Base de données

* **PostgreSQL via Supabase**

  * Stockage structuré (users, feedbacks, analyses…)
  * Support requêtes complexes
  * Extensible (RAG avec pgvector)

---

## 🔄 ORM

* **Prisma**

  * Typage fort des données
  * Migrations contrôlées
  * Sécurité et maintenabilité

---

## ⚡ Queue & Performance

* **Redis (Upstash)**

  * File d’attente (jobs IA)
  * Cache rapide
  * Gestion des tâches asynchrones

* **BullMQ**

  * Traitement en arrière-plan
  * Retry automatique
  * Scalabilité horizontale

---

## 🤖 Intelligence Artificielle

* **Gemini API (principal)**

  * Analyse : sentiment, résumé, priorité

* **Fallback possible : Groq**

  * Fiabilité en cas d’échec IA principale

---

## 📦 Stockage fichiers

* **Supabase Storage**

  * Images / audio des signalements

---

## 🔐 Authentification

* **JWT / Supabase Auth**

  * Gestion accès Admin / Super Admin
  * Mode anonyme configurable

---

# 🔄 **FLUX TECHNIQUE**

## 📌 1. Soumission

* L’utilisateur envoie un feedback via mobile/web
* API valide et stocke les données

## 📌 2. Mise en file

* Création d’un job dans Redis (BullMQ)

## 📌 3. Traitement IA

* Worker récupère le job
* Appel API Gemini
* Génération :

  * sentiment
  * résumé
  * score priorité
  * recommandation

## 📌 4. Stockage

* Résultats enregistrés en base

## 📌 5. Exploitation

* Dashboard consomme les données analytiques

---

# 🚀 **CHOIX TECHNIQUES (JUSTIFICATION)**

## 🔹 Architecture asynchrone

👉 évite de bloquer l’API
👉 améliore performance et UX

---

## 🔹 Redis + BullMQ

👉 standard industrie pour queues
👉 permet montée en charge

---

## 🔹 Prisma

👉 réduit erreurs DB
👉 code maintenable et typé

---

## 🔹 Supabase

👉 rapide à mettre en place
👉 combine DB + Storage + Auth

---

## 🔹 Gemini API

👉 gratuit / rapide
👉 adapté NLP (analyse texte)

---

# 📈 **SCALABILITÉ**

* API et Worker découplables
* Ajout de workers possible
* Cache Redis pour réduire latence
* DB PostgreSQL scalable

---

# 🔐 **SÉCURITÉ**

* Validation des entrées (Zod)
* Rate limiting
* Auth configurable (anonyme ou obligatoire)
* Isolation des services (API / Worker)

---

# 🧠 **VALEUR AJOUTÉE**

* Analyse automatique des retours étudiants
* Aide à la décision stratégique
* Centralisation des feedbacks multi-format
* Architecture prête pour SaaS futur

---

# ✅ **CONCLUSION**

Backend conçu pour être :

* **modulaire**
* **scalable**
* **performant**
* **évolutif vers un produit réel**

---

Si tu veux, je peux te faire une version **encore plus “jury hackathon” (pitch technique oral 1 min)** ou une version **schéma architecture propre à mettre dans ton rapport**.
