[J'ai terminé les corrections, les tests de cohérence et la mise à jour de la documentation. Voici le compte-rendu final des actions effectuées :

1. Correction des Problèmes Identifiés
Prisma Client : J'ai régénéré le client Prisma (npx prisma generate) après avoir corrigé le schéma (valeur @default(PROPOSED) et ajout des relations manquantes dans le modèle User).
Repository Décisions : Le DecisionStatus.PROPOSED est maintenant correctement reconnu et utilisé comme statut par défaut.
Validation (Zod) : Suppression de l'avertissement sur l'import inutilisé et mise à jour des schémas pour accepter les nouveaux statuts (PROPOSED, IN_PROGRESS, etc.).
2. Finalisation du Flux d'Analyse IA
Le backend gère désormais intelligemment les propositions :

Signalements Graves : Création automatique d'une décision PROPOSED uniquement pour les priorités HIGH ou CRITICAL.
Analyse Globale : Implémentation complète du service permettant de croiser n'importe quelle donnée. L'IA génère un rapport (AnalysisReport) et propose des décisions si nécessaire.
Campagnes : Clôture avec une proposition de décision systématique pour suivi.
3. Mise à jour de la Documentation et Swagger
Swagger : Les fichiers de routes (decisions.route.ts et analytics.route.ts) ont été mis à jour avec les nouveaux statuts et le nouvel endpoint d'analyse globale.
Nouveau Document : Création de 

ai_analysis_flow.md
 qui explique tout le nouveau flux. Ce document est votre guide pour l'implémentation côté Web.
4. Endpoints à utiliser pour le Web
POST /api/analytics/global-analysis : Pour lancer l'analyse IA avec filtres.
GET /api/decisions?status=PROPOSED : Pour lister les suggestions de l'IA à valider.
PATCH /api/decisions/:id/status : Pour passer une décision de PROPOSED à APPROVED ou REJECTED.
Tout est prêt pour votre intégration frontend. Le backend est maintenant proactif, filtré par l'IA et totalement sous contrôle humain pour la validation finale.]


# Flux d'Analyse IA et Prise de Décision

Ce document détaille comment le backend gère les analyses automatiques par l'IA et la génération proactive de propositions de décision.

## 1. Vue d'Ensemble
Le système utilise l'IA pour filtrer le bruit des données académiques et ne présenter aux administrateurs que les situations nécessitant une intervention.

### Principes Clés :
- **Analyse Proactive** : L'IA analyse les signalements et les campagnes dès qu'ils sont soumis ou clôturés.
- **Décisions Discrétionnaires** : Une proposition de décision (`PROPOSED`) n'est créée que si l'IA détecte une urgence ou une gravité réelle.
- **Validation Humaine** : Aucune décision n'est appliquée sans la validation (`APPROVED`) d'un administrateur.

---

## 2. Les Trois Sources de Décision

### A. Les Signalements (Reports)
Chaque signalement créé déclenche un job d'analyse IA en arrière-plan.
1. **Traitement** : L'IA détermine le sentiment, la catégorie, la priorité et fournit une recommandation.
2. **Condition** : Si la priorité identifiée est **HIGH** ou **CRITICAL**, une entrée est automatiquement créée dans la table `Decision` avec le statut `PROPOSED`.
3. **Liaison** : La décision est liée au `reportId`.

### B. Les Campagnes d'Évaluation
À la clôture d'une campagne (date d'échéance passée) :
1. **Synthèse** : Le système regroupe toutes les évaluations de la campagne.
2. **Analyse** : L'IA génère un rapport global de la campagne.
3. **Décision** : Une décision `PROPOSED` est créée systématiquement pour clôturer administrativement la campagne avec un plan d'action suggéré.
4. **Liaison** : La décision est liée au `campaignId`.

### C. L'Analyse Globale (Nouveau)
L'utilisateur peut lancer une analyse transversale via l'endpoint `/api/analytics/global-analysis`.
1. **Filtres** : On peut croiser les données par campus, professeur, module ou classe sur une période donnée.
2. **Rapport** : Un `AnalysisReport` est sauvegardé en base de données avec le détail de la synthèse IA.
3. **Décisions Proactives** : Si l'analyse globale révèle des points critiques, l'IA peut proposer plusieurs décisions simultanément, liées à l'`analysisId`.

---

## 3. États des Décisions
Le champ `status` d'une décision suit ce cycle :

| Statut | Description |
| :--- | :--- |
| `PROPOSED` | (Par défaut) Suggéré par l'IA. Visible dans l'onglet "En attente". |
| `APPROVED` | Validé par l'admin. La décision devient une action officielle. |
| `REJECTED` | Rejeté par l'admin. Archivé sans suite. |
| `IN_PROGRESS`| L'action est en cours de réalisation sur le terrain. |
| `DONE` | L'action est terminée. |

---

## 4. Guide d'Implémentation Frontend (Web)

### Page "Décisions"
- Filtrer par défaut sur `status=PROPOSED` pour afficher les nouvelles suggestions.
- Ajouter des boutons "Approuver" (`PATCH /status {status: 'APPROVED'}`) et "Rejeter" (`PATCH /status {status: 'REJECTED'}`).
- Afficher le champ `aiSuggestion` de manière distincte du `rationale` pour aider l'admin.

### Page "Rapport IA / Analyse Globale"
- Formulaire de filtres (Dates, Campus, etc.).
- Affichage du `AnalysisReport.content` (Synthèse, KPIs).
- Liste des décisions qui ont été auto-générées suite à cette analyse.

---

## 5. Endpoints API Relatifs

- `POST /api/decisions` : Création manuelle.
- `PATCH /api/decisions/:id/status` : Validation/Rejet.
- `POST /api/analytics/global-analysis` : Lancer une nouvelle analyse transversale.
- `GET /api/decisions?status=PROPOSED` : Lister les propositions de l'IA.
