# Guide d'Import de la Base de Données PostgreSQL vers Supabase

Ce guide explique comment exporter votre base de données PostgreSQL locale et l'importer sur Supabase.

---

## 📋 Prérequis

1. **PostgreSQL installé localement** avec la base de données `gsurvey`
2. **Compte Supabase** avec un projet créé
3. **Outils requis** :
   - `pg_dump` (généralement inclus avec PostgreSQL)
   - `psql` (client PostgreSQL)
   - Les deux doivent être dans votre PATH

---

## 🔍 Étape 1 : Vérifier les Outils PostgreSQL

### Windows PowerShell

```powershell
# Vérifier que pg_dump et psql sont disponibles
pg_dump --version
psql --version
```

Si les commandes ne sont pas reconnues, ajoutez PostgreSQL au PATH :
- Chemin typique : `C:\Program Files\PostgreSQL\17\bin` (ou votre version)
- Ajoutez-le aux variables d'environnement système

---

## 📤 Étape 2 : Exporter la Base de Données Locale

### Méthode A : Script Automatique (Recommandé)

Utilisez le script PowerShell fourni :

```powershell
cd scripts
.\export-db-to-supabase.ps1
```

Le script va :
1. Créer un dump SQL de votre base locale
2. Préparer le fichier pour Supabase
3. Afficher les instructions pour l'import

### Méthode B : Export Manuel

```powershell
# Depuis le répertoire racine du projet
pg_dump -h localhost -p 5432 -U postgres -d gsurvey -F c -b -v -f "backup_gsurvey_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"

# Ou en format SQL (plus facile à modifier)
pg_dump -h localhost -p 5432 -U postgres -d gsurvey -F p -n public -f "backup_gsurvey.sql"
```

**Options importantes** :
- `-F c` : Format custom (binaire, plus compact)
- `-F p` : Format SQL (texte, plus lisible)
- `-b` : Inclut les blobs (données binaires)
- `-v` : Mode verbeux
- `-n public` : Exporte uniquement le schéma `public`

---

## 🔧 Étape 3 : Préparer le Fichier SQL pour Supabase

### Modifications nécessaires

1. **Supprimer les commandes CREATE DATABASE** (Supabase utilise `postgres`)
2. **Supprimer les commandes CREATE EXTENSION** (PostGIS sera activé manuellement)
3. **Adapter les séquences** si nécessaire

### Script de nettoyage automatique

Le script `export-db-to-supabase.ps1` effectue ces modifications automatiquement.

---

## 🌐 Étape 4 : Récupérer les Informations de Connexion Supabase

1. Allez sur [supabase.com](https://supabase.com) → Votre projet
2. **Settings** → **Database**
3. Copiez les informations suivantes :
   - **Host** : `db.[PROJECT-REF].supabase.co`
   - **Port** : `5432`
   - **Database** : `postgres` (toujours)
   - **User** : `postgres`
   - **Password** : Le mot de passe que vous avez noté lors de la création

4. **Connection string** (URI) :
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

---

## 📥 Étape 5 : Activer PostGIS sur Supabase

**IMPORTANT** : PostGIS doit être activé avant d'importer les données géospatiales.

1. Dans Supabase : **SQL Editor** (icône SQL dans la barre latérale)
2. Exécutez cette commande :

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

3. Vérifiez que l'extension est activée :

```sql
SELECT PostGIS_version();
```

---

## 📥 Étape 6 : Importer les Données dans Supabase

### Méthode A : Via psql (Recommandé)

```powershell
# Remplacer [PASSWORD] et [PROJECT-REF] par vos valeurs
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f backup_gsurvey_cleaned.sql
```

### Méthode B : Via SQL Editor de Supabase (Pour petits fichiers)

1. Ouvrez **SQL Editor** dans Supabase
2. Ouvrez votre fichier `backup_gsurvey_cleaned.sql`
3. Collez le contenu dans l'éditeur
4. Cliquez sur **Run**

**⚠️ Limitation** : Le SQL Editor a une limite de taille. Utilisez `psql` pour les grandes bases.

### Méthode C : Via pg_restore (Pour fichiers .dump)

```powershell
# Si vous avez utilisé pg_dump -F c (format custom)
pg_restore -h db.[PROJECT-REF].supabase.co -p 5432 -U postgres -d postgres --clean --if-exists -v backup_gsurvey.dump
```

---

## 🔄 Étape 7 : Importer avec le Script Automatique

Le script `export-db-to-supabase.ps1` peut également importer automatiquement :

```powershell
cd scripts
.\export-db-to-supabase.ps1 -ImportToSupabase
```

Vous devrez fournir :
- L'URI de connexion Supabase
- Le fichier SQL à importer

---

## ✅ Étape 8 : Vérifier l'Import

### Vérifier les tables

Dans Supabase → **Table Editor** :
- Vérifiez que toutes les tables sont présentes :
  - `users`
  - `teams`
  - `surveys`
  - `responses`
  - `notifications`
  - `questions`
  - `answers`

### Vérifier les données

Dans **SQL Editor**, exécutez :

```sql
-- Compter les enregistrements
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'teams', COUNT(*) FROM teams
UNION ALL
SELECT 'surveys', COUNT(*) FROM surveys
UNION ALL
SELECT 'responses', COUNT(*) FROM responses
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
```

### Vérifier PostGIS

```sql
-- Tester PostGIS
SELECT ST_MakePoint(0, 0) as test_point;
```

---

## 🐛 Dépannage

### Erreur : "extension postgis does not exist"

**Solution** : Activez PostGIS avant l'import (Étape 4)

### Erreur : "relation already exists"

**Solution** : Les tables existent déjà. Utilisez `--clean` avec pg_restore ou supprimez les tables manuellement :

```sql
-- Dans Supabase SQL Editor (ATTENTION : supprime toutes les données)
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
```

### Erreur : "permission denied"

**Solution** : Vérifiez que vous utilisez le bon utilisateur (`postgres`) et le bon mot de passe.

### Erreur : "connection timeout"

**Solution** :
- Vérifiez que votre IP est autorisée dans Supabase (Settings → Database → Connection Pooling)
- Utilisez le Session Pooler si nécessaire (port 6543)

### Erreur : "SSL required"

**Solution** : Le script utilise automatiquement SSL pour Supabase. Si l'erreur persiste, vérifiez que l'URI contient bien `supabase.co`.

### Erreur : "column does not exist" ou "missing column"

**Solution** : Appliquez les migrations manquantes après l'import :

```sql
-- Dans Supabase SQL Editor, exécutez les migrations
-- (Voir server/migrations/*.sql)
```

---

## 📝 Notes Importantes

1. **Nom de la base** : Supabase utilise toujours `postgres` comme nom de base par défaut
2. **PostGIS** : Doit être activé avant l'import des données géospatiales
3. **Sécurité** : Les mots de passe sont stockés en hash (bcrypt), ils seront préservés
4. **UUID** : Les UUID générés localement seront conservés
5. **Timestamps** : Les dates de création/modification seront préservées

---

## 🔄 Migration Incrémentale (Mise à Jour)

Pour mettre à jour Supabase avec les nouvelles données locales :

1. Exportez uniquement les nouvelles données (avec `--data-only`)
2. Ou utilisez un script de synchronisation personnalisé
3. Ou réimportez complètement (⚠️ supprime les données existantes)

---

## 📚 Commandes Utiles

### Voir la taille de la base locale

```sql
-- Dans psql local
SELECT pg_size_pretty(pg_database_size('gsurvey'));
```

### Voir la taille de la base Supabase

```sql
-- Dans Supabase SQL Editor
SELECT pg_size_pretty(pg_database_size('postgres'));
```

### Lister toutes les tables

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## 🎯 Résumé des Étapes Rapides

1. ✅ Vérifier `pg_dump` et `psql`
2. ✅ Exporter la base locale : `.\scripts\export-db-to-supabase.ps1`
3. ✅ Activer PostGIS sur Supabase
4. ✅ Importer : `psql "postgresql://..." -f backup_gsurvey_cleaned.sql`
5. ✅ Vérifier les tables et données

---

Bon import ! 🚀



