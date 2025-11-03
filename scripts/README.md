# Scripts de Migration et d'Utilitaires

Ce dossier contient les scripts utiles pour la gestion de la base de données et de l'application G-Survey.

## 📋 Liste des Scripts

### Scripts de Migration

#### 1. `add-profile-fields.ps1` (Windows)
Script PowerShell pour ajouter les champs de profil à la base de données.

**Usage :**
```powershell
cd scripts
.\add-profile-fields.ps1
```

**Ce qu'il fait :**
- Charge les variables d'environnement depuis `.env`
- Se connecte à PostgreSQL
- Applique la migration `server/migrations/add-profile-fields.sql`
- Ajoute 5 nouveaux champs à la table `users` :
  - `username` (VARCHAR 255, UNIQUE)
  - `gender` (VARCHAR 20)
  - `country` (VARCHAR 100)
  - `sector` (VARCHAR 100)
  - `organization_type` (VARCHAR 100)

#### 2. `add-profile-fields.sh` (Linux/Mac)
Équivalent Bash du script PowerShell ci-dessus.

**Usage :**
```bash
cd scripts
chmod +x add-profile-fields.sh
./add-profile-fields.sh
```

### Scripts de Maintenance

#### 3. `reset-db.ps1` (Windows)
Réinitialise complètement la base de données.

**⚠️ ATTENTION :** Supprime toutes les données !

**Usage :**
```powershell
cd scripts
.\reset-db.ps1
```

#### 4. `reset-db.sh` (Linux/Mac)
Équivalent Bash du script PowerShell ci-dessus.

**Usage :**
```bash
cd scripts
chmod +x reset-db.sh
./reset-db.sh
```

#### 5. `setup.sh` (Linux/Mac)
Script d'installation et de configuration initiale.

**Usage :**
```bash
cd scripts
chmod +x setup.sh
./setup.sh
```

### Scripts SQL

#### 6. `fix-supervisor-team.sql`
Corrige les relations entre superviseurs et équipes.

**Usage :**
```bash
psql -h localhost -p 5432 -U postgres -d gsurvey -f scripts/fix-supervisor-team.sql
```

## 🔧 Configuration

### Variables d'Environnement

Les scripts utilisent les variables d'environnement suivantes (définies dans `.env`) :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gsurvey
DB_USER=postgres
DB_PASSWORD=postgres
```

### Prérequis

1. **PostgreSQL installé** : Version 12 ou supérieure
2. **psql dans le PATH** : Le client PostgreSQL doit être accessible
3. **Droits d'accès** : Permissions pour modifier la base de données

#### Vérifier psql

**Windows :**
```powershell
psql --version
```

Si non trouvé, ajouter au PATH : `C:\Program Files\PostgreSQL\17\bin`

**Linux/Mac :**
```bash
psql --version
```

Si non installé :
- Linux : `sudo apt install postgresql-client`
- Mac : `brew install postgresql`

## 📝 Ordre d'Exécution des Migrations

1. **Installation initiale** : Les migrations sont appliquées automatiquement au premier démarrage du serveur
2. **add-profile-fields** : À exécuter après l'installation pour ajouter les nouveaux champs de profil

```bash
# Ordre recommandé
1. Installation de l'application
2. Premier lancement du serveur (migrations automatiques)
3. Arrêt du serveur
4. Exécution de add-profile-fields.ps1 ou .sh
5. Redémarrage du serveur
```

## 🐛 Dépannage

### Erreur : "psql n'est pas reconnu"

**Windows :**
1. Trouver le dossier bin de PostgreSQL : `C:\Program Files\PostgreSQL\17\bin`
2. Ajouter au PATH système :
   - Panneau de configuration > Système > Paramètres système avancés
   - Variables d'environnement > Variable système "Path"
   - Nouveau > Ajouter le chemin PostgreSQL

**Linux/Mac :**
```bash
sudo apt install postgresql-client  # Debian/Ubuntu
brew install postgresql              # macOS
```

### Erreur : "Connexion refusée"

1. Vérifier que PostgreSQL est démarré :
   ```bash
   # Windows
   services.msc  # Chercher "PostgreSQL"
   
   # Linux
   sudo systemctl status postgresql
   
   # Mac
   brew services list
   ```

2. Vérifier les credentials dans `.env`

### Erreur : "La colonne existe déjà"

La migration a déjà été appliquée. C'est normal, aucune action nécessaire.

### Erreur : "Permission refusée"

**Linux/Mac :**
```bash
chmod +x scripts/*.sh
```

## 📊 Vérification Post-Migration

Après l'exécution d'une migration, vérifier que tout s'est bien passé :

```sql
-- Se connecter
psql -h localhost -p 5432 -U postgres -d gsurvey

-- Lister les colonnes
\d users

-- Ou avec SQL
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais committer le fichier .env**
2. **Faire des sauvegardes** avant d'exécuter des scripts de modification
3. **Tester en développement** avant de déployer en production
4. **Documenter les changements** dans les fichiers de migration

### Sauvegarde Rapide

```bash
# Avant une migration importante
pg_dump -h localhost -p 5432 -U postgres -d gsurvey > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration si besoin
psql -h localhost -p 5432 -U postgres -d gsurvey < backup_YYYYMMDD_HHMMSS.sql
```

## 📚 Ressources

- **Documentation principale** : Voir les fichiers `.md` à la racine du projet
- **Guide de test** : `GUIDE_TEST_NOUVELLES_PAGES.md`
- **Guide de mise à jour** : `MISE_A_JOUR_PROFIL_UTILISATEUR.md`
- **Guide rapide** : `GUIDE_RAPIDE_MISE_A_JOUR_PROFIL.md`

## 🆘 Aide

En cas de problème :
1. Consulter la section Dépannage ci-dessus
2. Vérifier les logs du serveur backend
3. Consulter la documentation PostgreSQL

---

**Utilisez ces scripts avec précaution et faites toujours des sauvegardes ! 🔒**


