# Perspectives et Évolution IA — AFI-LISTEN

Ce document présente la vision stratégique de l'intégration de l'Intelligence Artificielle au sein de la plateforme AFI-LISTEN. Il détaille deux étapes d'évolution pour maximiser la performance, réduire les coûts et garantir la confidentialité.

---

## PARTIE 1 : L'Approche Hybride Optimisée (Le meilleur combo SaaS)
*Idéal pour le lancement, la croissance rapide (jusqu'à 15 000 étudiants) et la rentabilité.*

L'objectif de cette phase est d'abandonner l'injection de contexte brute (Context Stuffing) pour passer au **RAG (Retrieval-Augmented Generation)** en s'appuyant sur les modèles payants les plus rentables du marché.

### 🛠️ La Stack Technique
- **Base de données Vectorielle** : `Supabase` avec l'extension native `pgvector`.
- **Modèle d'Embedding** : `text-embedding-3-small` (OpenAI) ou `text-embedding-004` (Gemini) pour transformer le texte en vecteurs mathématiques.
- **Modèle de Chat (LLM)** : `GPT-4o-mini` (OpenAI) ou `Claude 3 Haiku` (Anthropic). Ce sont les rois du rapport Qualité/Prix.

### ⚙️ Comment ça marche ?
1. Chaque fois qu'un étudiant soumet un signalement ou que l'école publie un règlement (PDF), notre worker génère une empreinte mathématique (vecteur) de ce texte.
2. Lorsqu'un étudiant ou un admin pose une question au Chat, le système cherche les 5 documents **mathématiquement les plus proches** de la question dans toute la base de données.
3. Seuls ces 5 documents utiles sont envoyés à l'IA pour qu'elle formule sa réponse.

### 💰 Coûts et Gains
- **Coût de mise en place** : 1 à 2 jours de développement.
- **Coût d'exploitation** : ~10$ à 15$ / mois pour une école de 2 000 étudiants très actifs (0.15$ par Million de tokens).
- **Gains majeurs** :
  - **Zéro hallucination** : L'IA ne devine pas, elle se base strictement sur les documents retournés par le RAG.
  - **Mémoire infinie** : L'IA peut interroger un historique de 5 ans de données en 1 seconde.
  - **Économie de tokens** : Division par 6 de la taille des requêtes envoyées à l'IA.

---

## PARTIE 2 : La Souveraineté Totale (Notre propre IA "Maison")
*La vision à long terme pour devenir une solution Enterprise-Ready, ultra-sécurisée et vendre l'outil à des universités prestigieuses.*

Ici, on ne dépend plus de Google, OpenAI ou Meta. On héberge **notre propre cerveau artificiel** qui connaît l'école sur le bout des doigts.

### 🛠️ La Stack Technique
- **Modèle Open Source (Base)** : `Llama 3 (8B ou 70B)` de Meta ou `Mistral Nemo`.
- **Méthode d'apprentissage** : **Fine-Tuning** (ré-entraînement) + RAG.
- **Hébergement** : Serveur Physique Dédié (Bare-Metal) équipé de cartes graphiques (ex: RTX 4090 ou Nvidia A100) loué chez Hetzner ou OVH.
- **Moteur d'inférence** : `vLLM` ou `Ollama` pour exposer l'IA sous forme d'API locale (compatible avec le code AFI-LISTEN actuel).

### ⚙️ Comment ça marche ?
Nous prenons un modèle vierge très intelligent (Llama 3) et nous l'entraînons (Fine-Tuning) pendant plusieurs heures sur les données dépersonnalisées de l'école (le ton de l'administration, la structure hiérarchique, les mots-clés du campus). 
Le modèle devient alors un "Employé virtuel" de l'école. En y ajoutant le RAG (voir Partie 1), il a accès aux signalements en temps réel.

### 💰 Coûts et Gains
- **Coût de mise en place** : 2 à 4 semaines de travail pour un Ingénieur IA (préparation des datasets, entraînement, déploiement serveur).
- **Coût d'exploitation** : **~150$ à 300$ / mois** (Abonnement fixe pour la location du serveur GPU).
- **Gains majeurs** :
  - **Confidentialité 100% (Le plus grand argument de vente)** : Les noms des étudiants, les problèmes de harcèlement, les notes... AUCUNE donnée ne quitte le réseau de l'école. C'est obligatoire pour respecter les normes strictes de certaines institutions (RGPD, etc.).
  - **Coût Fixe Illimité** : Que l'école ait 1 000 ou 100 000 étudiants, le serveur coûte 150$/mois. Plus il y a d'utilisateurs, plus c'est rentable comparé à une tarification au token.
  - **Sur-mesure** : L'IA n'est pas "générique". Elle est littéralement formatée pour votre plateforme et votre vision pédagogique.
