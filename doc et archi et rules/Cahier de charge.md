# **Cahier des charges structuré — AFI-LISTEN IA**

**Version :** 1.0  
**Date :** 11 avril 2026  
**Périmètre :** Mobile Flutter \+ Site web de signalement \+ Dashboard \+ Backend \+ Couche IA  
**Finalité :** Mettre en place une plateforme de signalement, d’évaluation pédagogique et d’analyse décisionnelle, extensible et modulaire.

---

## **1\. Présentation générale**

AFI-LISTEN IA est une plateforme multi-canaux destinée à collecter des signalements, des retours d’expérience et des évaluations académiques, puis à les transformer en informations exploitables pour la direction et les responsables pédagogiques.

Le système doit permettre :

* la saisie rapide d’un signalement ou d’une évaluation,   
* l’assistance par IA dans la rédaction et la structuration,  
* l’analyse automatique des retours,  
* la consultation de tableaux de bord et d’indicateurs,  
* la génération de synthèses et de recommandations.

---

## **2\. Objectifs du projet**

### **Objectif principal**

Centraliser les retours des étudiants et produire une lecture claire, exploitable et priorisable pour la prise de décision.

### **Objectifs secondaires**

* Réduire le temps nécessaire pour soumettre un signalement.  
* Proposer une expérience fluide sur mobile,web  et dashboard.  
* Permettre une configuration flexible des formulaires et des règles d’accès.  
* Ajouter une couche IA pour assister la saisie, l’analyse et la synthèse.  
* Prévoir une architecture suffisamment propre pour évoluer vers une version produit.

---

## **3\. Principes de conception**

Le système doit respecter les principes suivants :

* **Modularité** : chaque fonctionnalité doit pouvoir être ajoutée, retirée ou remplacée sans refonte complète.  
* **Flexibilité** : les formulaires, rubriques, catégories et règles doivent être configurables.  
* **Cohérence** : une même logique de données doit être utilisée sur toutes les plateformes.  
* **Scalabilité** : l’architecture doit supporter une montée en charge raisonnable.  
* **Simplicité d’usage** : la soumission doit rester rapide, guidée et compréhensible.  
* **IA utile, pas décorative** : l’IA doit assister, structurer, résumer et analyser, pas remplacer les règles métier.

---

## **4\. Architecture globale**

### **4.1 Composants**

* **Application mobile** : Flutter  
* **Site web de signalement** : Next.js  
* **Dashboard d’administration** : Next.js  
* **Backend métier** : Node.js \+ Express \+ TypeScript  
* **Base de données et stockage** : Supabase  
* **Couche IA** : API Gemini \+ Groq selon les besoins  
* **Traitements asynchrones** : file de jobs pour l’analyse et la transcription

### **4.2 Rôle de chaque couche**

* **Mobile / Web** : collecte des données.  
* **Backend** : validation, orchestration, sécurité, logique métier.  
* **Base de données** : stockage des signalements, évaluations, utilisateurs, analyses et décisions.  
* **IA** : assistance à la saisie, analyse automatique, synthèse, chatbot.  
* **Dashboard** : consultation, pilotage, statistiques, suivi des actions.

---

## **5\. Plateformes et fonctionnalités**

## **5.1 Application mobile Flutter**

### **Rôle**

Plateforme de saisie rapide destinée aux étudiants.

### **Fonctionnalités obligatoires**

* Authentification si activée par l’administration.  
* Création de signalement rapide.  
* Création d’évaluation de cours ou de professeur.  
* Saisie texte.  
* Saisie vocale avec transcription.  
* Ajout de pièces jointes : image, audio, fichier.  
* Choix du type de retour : signalement, évaluation, suggestion.  
* Choix d’une rubrique ou d’un module.  
* Possibilité de soumission anonyme si autorisée.  
* Validation finale avant envoi.  
* Confirmation de réception.

### **Fonctionnalités optionnelles**

* Brouillon local.  
* Mode hors ligne avec synchronisation ultérieure.  
* Pré-remplissage selon profil ou dernier usage.  
* Suggestions automatiques de champs par IA.

---

## **5.2 Site web de signalement**

### **Rôle**

Version web légère du formulaire, accessible par navigateur et adaptée à un usage rapide.

### **Fonctionnalités obligatoires**

* Formulaire de signalement rapide.  
* Formulaire d’évaluation des cours ou enseignants.  
* Authentification conditionnelle selon la politique active.  
* Upload de fichiers.  
* Interface responsive.  
* Validation des champs avant soumission.  
* Résumé final avant envoi.  
* Confirmation après soumission.

### **Fonctionnalités optionnelles**

* Accès via QR code.  
* Formulaires dynamiques selon la rubrique choisie.  
* Suggestion IA pendant la saisie.

---

## **5.3 Dashboard d’administration**

### **Rôle**

Espace de pilotage pour la direction, les responsables pédagogiques et les administrateurs.

### **Fonctionnalités obligatoires**

* Tableau de bord avec KPI principaux.  
* Liste des signalements et évaluations.  
* Filtres par date, classe, professeur, module, catégorie, statut.  
* Visualisation des tendances.  
* Consultation des analyses IA.  
* Suivi des décisions et actions.  
* Gestion des catégories et rubriques.  
* Gestion des formulaires.  
* Gestion des accès et rôles.  
* Export PDF et Excel.

### **Fonctionnalités optionnelles**

* Heatmap des problèmes récurrents.  
* Comparaison entre classes ou modules.  
* Recherche sémantique dans les retours.  
* Chat IA sur les données.  
* Historique de performance des modules et enseignants.

---

## **5.4 Backend Node.js**

### **Rôle**

Cœur logique du système.

### **Fonctionnalités obligatoires**

* Réception des formulaires.  
* Validation des données.  
* Gestion des fichiers.  
* Authentification et autorisation.  
* Gestion des règles d’accès.  
* Orchestration des analyses IA.  
* Stockage des analyses et des décisions.  
* Journalisation des actions importantes.  
* Gestion des erreurs et des retries.

### **Fonctionnalités optionnelles**

* Webhooks.  
* Batch processing.  
* Cache.  
* Moteur de règles métier avancé.

---

## **6\. Modules fonctionnels**

## **typeMajeur**

* signalement  
* evaluation 

* ## suggestion 

## **6.1 Module Signalement**

### **But**

Permettre à un étudiant de signaler rapidement un problème, une anomalie ou une suggestion.

### **Types possibles**

* problème matériel,  
* problème administratif,  
* problème pédagogique,  
* incident ponctuel,  
* autre.

### **Champs communs**

* titre,  
* description,  
* type  
* catégorie,  
* priorité,  
* classe,  
* professeur,  
* module,  
* pièces jointes,  
* anonymat,  
* date.

---

## **6.2 Module Évaluation**

### **But**

Permettre aux étudiants d’évaluer un module ou un professeur à la fin d’un cours.

### **Principe**

Le formulaire doit rester simple et rapide, car le besoin est récurrent et répétitif.

### **Champs recommandés**

* professeur concerné,  
* module concerné,  
* classe concernée,  
* note globale sur 20,  
* clarté du cours,  
* pédagogie,  
* disponibilité,  
* rythme,  
* commentaire libre,  
* anonymat.

### **Résultats attendus**

* moyenne par module,  
* moyenne par professeur,  
* tendances,  
* synthèse des retours,  
* indicateurs d’amélioration.

---

## **6.3 Module Décisions**

### **But**

Transformer les analyses en éléments de décision.

### **Statuts possibles**

* à étudier,  
* en cours,  
* validé,  
* rejeté,  
* terminé.

### **Contenu**

* titre de l’action,  
* description,  
* source,  
* priorité,  
* responsable,  
* échéance,  
* statut.

---

## **7\. Couche IA**

## **7.1 Rôle général de l’IA**

L’IA doit servir à :

* assister la saisie,  
* structurer les informations,  
* résumer les retours,  
* détecter les tendances,  
* produire des recommandations,  
* permettre des questions en langage naturel sur les données.

## **7.2 Cas d’usage IA obligatoires**

* Assistant de remplissage du formulaire.  
* Reformulation automatique du message utilisateur.  
* Transcription vocale.  
* Analyse automatique d’un signalement.  
* Analyse automatique d’une évaluation.  
* Résumé automatique des retours.  
* Chatbot de consultation sur les données du dashboard.  
* Génération de synthèses périodiques.

## **7.3 Cas d’usage IA optionnels**

* Détection de regroupements de problèmes similaires.  
* Suggestion de priorité.  
* Détection de signaux faibles.  
* Recherche intelligente dans l’historique.  
* Recommandations par module ou professeur.

## **7.4 Règles de fonctionnement IA**

* L’IA ne doit pas être la source de vérité.  
* La base de données reste la référence.  
* Les réponses IA doivent être structurées.  
* Les sorties doivent être exploitables par le système.  
* Les résultats doivent pouvoir être stockés et rejoués.

## **7.5 Sortie standard IA**

Chaque analyse doit produire un format stable, par exemple :

* sentiment,  
* catégorie,  
* priorité,  
* résumé,  
* recommandation,  
* confiance,  
* horodatage.

---

## **8\. Moteur de formulaires ultra-flexible**

Le système doit utiliser un moteur de formulaires dynamique afin de conserver une même logique de sortie, même si le formulaire change.

### **Objectif**

Pouvoir ajouter, retirer ou modifier un formulaire sans changer toute l’application.

### **Principe**

Chaque formulaire doit être défini par un schéma.

### **Exemples de schémas**

* signalement simple,  
* signalement avancé,  
* évaluation de module,  
* évaluation de professeur,  
* formulaire guidé par IA.

### **Avantage**

* même backend,  
* même structure de réponse,  
* même pipeline d’analyse,  
* expérience cohérente sur mobile et web.

---

## **9\. Gestion de l’authentification**

### **Principe**

L’administration peut activer ou désactiver l’obligation de connexion avant soumission.

### **Modes possibles**

* anonyme autorisé,  
* authentification obligatoire,  
* accès limité par invitation,  
* accès réservé à certaines cohortes.

### **Effet attendu**

* comportement cohérent sur mobile et web,  
* règle contrôlée côté backend,  
* sécurité appliquée au niveau des données.

---

## **10\. Structure des données**

### **Entités principales**

* utilisateurs,  
* rôles,  
* signalements,  
* évaluations,  
* pièces jointes,  
* analyses IA,  
* catégories,  
* modules,  
* professeurs,  
* classes,  
* décisions,  
* paramètres système,  
* journaux d’audit.

### **Exigence de conception**

Chaque entité doit être pensée pour supporter des évolutions futures sans refonte majeure.

---

## **11\. Exigences non fonctionnelles**

* interface rapide,  
* fonctionnement responsive,  
* sécurité des accès,  
* validation stricte des données,  
* architecture maintenable,  
* traitement asynchrone des tâches lourdes,  
* export des données,  
* traçabilité des actions,  
* performance suffisante pour un environnement scolaire.

---

## **12\. Exigences de qualité**

### **Qualité attendue**

* simplicité,  
* stabilité,  
* lisibilité,  
* modularité,  
* cohérence visuelle,  
* cohérence fonctionnelle,  
* évolutivité.

### **Contraintes de conception**

* éviter les doublons de logique,  
* éviter les traitements lourds dans les requêtes synchrones,  
* séparer clairement saisie, analyse et restitution.

---

## **13\. Répartition des responsabilités**

### **Mobile**

* Capture rapide et assistée.  
* Interaction vocale et guidée.  
* Gestion des pièces jointes.  
* Respect des règles d’authentification.

### **Site web**

* Accès rapide aux formulaires  
* Interface de soumission simplifiée  
* Support des formulaires dynamiques

### **Dashboard**

* Visualisation des données  
* Analyse et filtrage  
* Pilotage des décisions  
* Configuration du système

### **Backend**

* Logique métier  
* Validation des données  
* Sécurité et gestion des accès  
* Orchestration des traitements IA

### **IA**

* Assistance à la saisie  
* Analyse automatique  
* Génération de résumés  
* Interaction via chatbot

---

## **14\. Évolutions possibles**

Le système doit pouvoir évoluer vers :

* gestion de plusieurs établissements,  
* tableaux comparatifs multi-campus,  
* notifications intelligentes,  
* détection de tendances récurrentes,  
* score de satisfaction par module,  
* suivi de plans d’action,  
* Version SaaS.

---

## **15\. Priorités de réalisation**

### **Priorité 1**

* 1 formulaire ultra-flexible de  signalement, d’évaluation,sugestion  
* backend de réception,  
* dashboard minimum,  
* stockage des données.

### **Priorité 2**

* IA de synthèse,  
* transcription vocale,  
* chat IA,  
* filtres avancés,  
* export.

### **Priorité 3**

* moteur de formulaires dynamique,  
* règles d’authentification avancées,  
* analyses prédictives,  
* recherche intelligente.

---

## **16\. Règle de validation du projet**

Le projet sera considéré comme conforme si :

* les signalements peuvent être envoyés depuis mobile et web,  
* les évaluations de modules/professeurs sont prises en charge,  
* le dashboard affiche les données de manière claire,  
* l’IA peut analyser et résumer les retours,  
* le mode d’authentification peut être activé ou désactivé,  
* La structure reste modulaire et évolutive.

---

# **16\. Exigences de performance**

* Temps de réponse API rapide (\< 500 ms hors IA)  
* Traitement IA asynchrone  
* Chargement rapide des interfaces  
* Pagination obligatoire  
* Optimisation des requêtes

---

# **17\. Exigences de sécurité**

* Validation stricte des entrées  
* Authentification configurable  
* Gestion des rôles (admin / utilisateur)  
* Protection contre spam  
* Stockage sécurisé des fichiers  
* Respect de l’anonymat  
* Journalisation des actions

---

# **18\. Gestion des erreurs et résilience**

* Gestion centralisée des erreurs  
* Retry automatique des traitements IA  
* Statuts des traitements (pending, success, failed)  
* Logs exploitables  
* Fallback en cas d’échec IA

---

# **19\. Stratégie de test**

* Tests unitaires backend  
* Tests d’intégration API  
* Tests des formulaires  
* Tests UX mobile et web  
* Vérification des résultats IA

---

# **20\. Déploiement et exploitation**

### **Déploiement**

* Frontend : plateforme serverless  
* Backend : service dédié  
* Base de données : solution managée

### **Exploitation**

* Monitoring des erreurs  
* Suivi des performances  
* Mise à jour continue  
* Gestion des versions

---

## **21\. Conclusion**

AFI-LISTEN IA doit être conçu comme une plateforme unifiée de collecte, d’évaluation et d’analyse, avec une architecture flexible capable d’absorber de nouvelles fonctionnalités sans rupture.

Le socle principal repose sur :

* une logique de formulaires dynamiques,  
* une sortie de données standardisée,  
* une séparation claire entre saisie, traitement et analyse,  
* une IA intégrée comme couche d’assistance et d’interprétation.

