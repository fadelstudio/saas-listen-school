# 🗄️ AFI-LISTEN — SUPABASE SETUP COMPLET
> **Version :** 1.0 | **Date :** 2026-04-11  
> **Objectif :** Configurer Supabase pour recevoir le schéma du backend AFI-Listen  
> ⚠️ **Exécuter dans l'ordre exact — ne pas sauter d'étape**

---

## ÉTAPE 0 — PRÉREQUIS

Avant de commencer :

- [ ] Compte Supabase créé sur [https://supabase.com](https://supabase.com)
- [ ] Projet Supabase créé (région recommandée : EU West)
- [ ] Node.js ≥ 18 installé
- [ ] Fichier `.env` du projet configuré

---

## ÉTAPE 1 — RÉCUPÉRER LES CREDENTIALS SUPABASE

Dans le dashboard Supabase de ton projet :

1. Aller dans **Project Settings → Database**
2. Copier la **Connection string** (format Prisma / URI)
3. Aller dans **Project Settings → API**
4. Copier `URL` (Project URL) et `anon key` (API Key publique)

### Remplir le `.env`

```env
PORT=3000

# ⬇️ Connexion directe Supabase (pour Prisma)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"

# ⬇️ Auth
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# ⬇️ Supabase API (pour Storage et Auth Supabase si utilisés plus tard)
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_KEY=your_supabase_anon_key

# ⬇️ Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# ⬇️ IA
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

> ⚠️ **IMPORTANT** : Pour les connection poolers Supabase (IPv4), utiliser le port `6543` et ajouter `?pgbouncer=true` à la fin de `DATABASE_URL`.  
> Pour les migrations Prisma, utiliser le port `5432` (connexion directe, pas pooler).

### Deux variables DATABASE_URL si nécessaire

```env
# Connexion directe (pour prisma migrate)
DATABASE_URL="postgresql://postgres.[REF]:[PWD]@db.[REF].supabase.co:5432/postgres"

# Pooler (pour runtime production)
DATABASE_URL_DIRECT="postgresql://postgres.[REF]:[PWD]@db.[REF].supabase.co:5432/postgres?connection_limit=1"
```

---

## ÉTAPE 2 — INITIALISER PRISMA (si pas encore fait)

```bash
# Dans le répertoire du projet
npx prisma init
```

Vérifier que `prisma/schema.prisma` contient :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## ÉTAPE 3 — APPLIQUER LE SCHÉMA SUR SUPABASE

### 3.1 Générer le client Prisma

```bash
npx prisma generate
```

### 3.2 Créer la première migration

```bash
npx prisma migrate dev --name init
```

> Cette commande va :
> 1. Créer un dossier `prisma/migrations/`
> 2. Générer le SQL de migration
> 3. Appliquer la migration sur la base Supabase
> 4. Régénérer le client Prisma

### 3.3 Vérifier dans Supabase

Aller dans **Supabase Dashboard → Table Editor**

Tu dois voir les tables suivantes créées :

| Table | Description |
|---|---|
| `users` | Utilisateurs et leurs rôles |
| `reports` | Signalements soumis |
| `evaluations` | Évaluations de cours/professeurs |
| `decisions` | Décisions prises suite aux analyses |
| `ai_jobs` | Audit trail des traitements IA asynchrones |

---

## ÉTAPE 4 — SQL COMPLÉMENTAIRE SUR SUPABASE

Exécuter ces requêtes SQL dans **Supabase Dashboard → SQL Editor** dans cet ordre exact :

### 4.1 — Activer Row Level Security (RLS) sur toutes les tables

```sql
-- Activer RLS
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs     ENABLE ROW LEVEL SECURITY;
```

> ⚠️ Le backend utilise `DATABASE_URL` avec les credentials `postgres` (service role), donc il bypass le RLS. Le RLS est une couche de sécurité supplémentaire si Supabase JS client est utilisé côté frontend.

### 4.2 — Politique RLS : Service Role bypasse tout (backend)

```sql
-- Politique pour le service role (backend)
CREATE POLICY "Service role has full access" ON users
  FOR ALL USING (true);

CREATE POLICY "Service role has full access" ON reports
  FOR ALL USING (true);

CREATE POLICY "Service role has full access" ON evaluations
  FOR ALL USING (true);

CREATE POLICY "Service role has full access" ON decisions
  FOR ALL USING (true);

CREATE POLICY "Service role has full access" ON ai_jobs
  FOR ALL USING (true);
```

### 4.3 — Index de performance

```sql
-- Index sur les colonnes fréquemment filtrées

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Reports
CREATE INDEX IF NOT EXISTS idx_reports_author_id ON reports(author_id);
CREATE INDEX IF NOT EXISTS idx_reports_status    ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Evaluations
CREATE INDEX IF NOT EXISTS idx_evaluations_report_id    ON evaluations(report_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_id ON evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status       ON evaluations(status);

-- Decisions
CREATE INDEX IF NOT EXISTS idx_decisions_evaluation_id ON decisions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_decisions_decider_id    ON decisions(decider_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status        ON decisions(status);

-- AI Jobs
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status     ON ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_report_id  ON ai_jobs(report_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_created_at ON ai_jobs(created_at DESC);
```

### 4.4 — Trigger updated_at automatique (optionnel si Prisma gère)

```sql
-- Fonction trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer sur chaque table
CREATE TRIGGER update_users_updated_at       BEFORE UPDATE ON users       FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reports_updated_at     BEFORE UPDATE ON reports     FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_decisions_updated_at   BEFORE UPDATE ON decisions   FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_jobs_updated_at     BEFORE UPDATE ON ai_jobs     FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

### 4.5 — Données de seed (utilisateur admin initial)

```sql
-- Créer un admin initial (mot de passe à changer immédiatement)
-- ⚠️ Le hash ci-dessous correspond à "Admin@1234" avec bcrypt saltRounds=12
-- Générer un vrai hash via le backend avant la mise en production
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
VALUES (
  gen_random_uuid(),
  'admin@afi.com',
  '$2b$12$PLACEHOLDER_HASH_REPLACE_ME',  -- remplacer par un vrai hash
  'Admin',
  'AFI',
  'ADMIN',
  true
)
ON CONFLICT (email) DO NOTHING;
```

> ⚠️ **NE PAS** utiliser ce hash en production. Générer via le backend :  
> `const hash = await bcrypt.hash('VotreMotDePasse', 12);`

---

## ÉTAPE 5 — SUPABASE STORAGE (pour les pièces jointes)

Dans **Supabase Dashboard → Storage** :

### 5.1 Créer les buckets

```
Bucket name : attachments
Public : ❌ Non (privé)
```

### 5.2 SQL pour les policies Storage

```sql
-- Permettre au service role de tout gérer
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Policy upload (service role uniquement via backend)
CREATE POLICY "Backend can upload attachments"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'attachments');

-- Policy lecture (service role uniquement)
CREATE POLICY "Backend can read attachments"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'attachments');

-- Policy suppression
CREATE POLICY "Backend can delete attachments"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'attachments');
```

---

## ÉTAPE 6 — VÉRIFICATION FINALE

```bash
# Vérifier la connexion et l'état des migrations
npx prisma migrate status

# Ouvrir Prisma Studio pour voir les données
npx prisma studio

# Démarrer le serveur dev
npm run dev

# Tester le health check
curl http://localhost:3000/health
```

**Résultat attendu health check :**
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": null,
  "error": null
}
```

---

## COMMANDES DE RÉFÉRENCE PRISMA

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name <description>

# Appliquer migrations en production (sans génération)
npx prisma migrate deploy

# Reset complet de la base (⚠️ DANGEREUX — efface toutes les données)
npx prisma migrate reset

# Régénérer le client après changement de schéma
npx prisma generate

# Voir l'état des migrations
npx prisma migrate status

# Ouvrir l'interface Prisma Studio
npx prisma studio

# Formater le schéma
npx prisma format
```

---

## RÉCAPITULATIF CHECKLIST

- [ ] `.env` configuré avec les bonnes valeurs Supabase
- [ ] `npx prisma generate` exécuté
- [ ] `npx prisma migrate dev --name init` exécuté avec succès
- [ ] Tables visibles dans Supabase Table Editor
- [ ] RLS activé sur toutes les tables
- [ ] Index de performance créés
- [ ] Bucket `attachments` créé dans Storage
- [ ] `npm run dev` démarre sans erreur
- [ ] `/health` retourne `success: true`
