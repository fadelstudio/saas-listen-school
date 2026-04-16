# Modèle de Données (Prisma)

AFI-LISTEN utilise Prisma comme ORM avec une base de données PostgreSQL. Le modèle de données est conçu pour gérer une structure académique complexe, des utilisateurs multi-rôles, des signalements et des évaluations enrichis par IA.

## 📊 Diagramme de Relations (Simplifié)

```mermaid
erDiagram
    Campus ||--o{ Class : contains
    Campus ||--o{ User : has
    Campus ||--o{ Professor : has
    AcademicLevel ||--o{ Class : defines
    Class ||--o{ User : enrolls
    Class ||--o{ Report : receives
    Class ||--o{ Evaluation : receives
    Module ||--o{ ClassModule : "part of"
    Class ||--o{ ClassModule : "has"
    Professor ||--o{ Report : "mentions/handles"
    Professor ||--o{ Evaluation : "is evaluated"
    User ||--o{ Report : "creates"
    User ||--o{ Evaluation : "completes"
    Report ||--o{ Evaluation : "triggers"
    Report ||--o{ AiJob : "analyzed by"
    Evaluation ||--o{ Decision : "results in"
    Evaluation ||--o{ AiJob : "scored by"
    Decision ||--o{ AiJob : "suggested by"
```

## 📝 Modèles Principaux

### 1. Utilisateurs & Authentification

#### User
Gère les comptes, les rôles et l'appartenance institutionnelle.
- **Rôles** : `SUPERADMIN`, `ADMIN`, `MANAGER`, `AGENT`, `STUDENT`, `VIEWER`
- **Champs clés** : `email`, `matricule`, `fcmToken`, `isActive`, `campusId`, `classId`

#### RefreshToken / PasswordResetToken / LoginOtpChallenge
Gèrent la sécurité et la persistance des sessions.

---

### 2. Structure Académique

#### Campus
- **Champs** : `name`, `location`

#### Class (Classe/Groupe)
- **Champs** : `name`, `levelId`, `campusId`

#### AcademicLevel (Niveau d'étude)
- **Champs** : `name` (L1, L2, M1...), `order`

#### Module (Matière/Unité d'enseignement)
- **Champs** : `name`, `code`

#### ClassModule (Affectation)
Relie un Module à une Classe spécifique. C'est ici que les professeurs sont affectés.

#### Professor
- **Champs** : `firstName`, `lastName`, `email`, `userId` (optionnel)

---

### 3. Cœur de l'application (Feedback & Feedback Loop)

#### Report (Signalement)
Un ticket créé par un étudiant ou un agent.
- **Types** : `PROBLEM_MATERIAL`, `PROBLEM_ADMIN`, `PROBLEM_PEDAGOGICAL`, `INCIDENT`, `SUGGESTION`, `OTHER`
- **Statuts** : `DRAFT`, `SUBMITTED`, `REVIEWED`, `APPROVED`, `REJECTED`
- **IA** : Champ `aiAnalysis` (JSON) contenant l'analyse automatique.

#### Evaluation
Une évaluation pédagogique d'un module/professeur.
- **Rubrique (RatingBand)** : `VERY_POOR` à `EXCELLENT`
- **Champs** : `comprehensionRating`, `explanationRating`, `pedagogyRating`, `availabilityRating`, `rhythmRating`
- **Calcul** : `score` (/20) calculé à partir des ratings.
- **IA** : `aiScore` suggéré par l'IA.

#### Decision
Action prise suite à une évaluation ou un signalement.
- **Statuts** : `PENDING`, `APPROVED`, `REJECTED`, `DEFERRED`, `DONE`
- **IA** : `aiSuggestion` (Texte généré par l'IA).

---

### 4. Automatisation & IA

#### AiJob
Trace l'historique et l'état des analyses BullMQ.
- **Types** : `report-analysis`, `evaluation-scoring`, `decision-suggestion`
- **Statuts** : `QUEUED`, `PROCESSING`, `DONE`, `FAILED`

#### EvaluationCampaign
Période d'évaluation planifiée pour mobiliser les étudiants.
- **Scope** : `CLASS`, `CAMPUS`, `SCHOOL`

#### SystemSettings
Configuration dynamique SaaS (Toggles IA, Auth required, AI Configs).

---

## 🛠 Types TypeScript Générés (Aperçu)

```ts
type Feedback = {
  id: string
  title: string
  content: string
  type: "PROBLEM_MATERIAL" | "PROBLEM_ADMIN" | "PROBLEM_PEDAGOGICAL" | "INCIDENT" | "SUGGESTION" | "OTHER"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  status: "DRAFT" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED"
  aiAnalysis: any // JSON structured result
  createdAt: Date
}

type User = {
  id: string
  email: string
  role: "SUPERADMIN" | "ADMIN" | "MANAGER" | "AGENT" | "STUDENT" | "VIEWER"
  campusId?: string
  classId?: string
}
```
