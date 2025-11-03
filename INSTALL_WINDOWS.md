# 🪟 Guide d'Installation sur Windows - G-Survey

Guide complet pour installer et configurer G-Survey sur Windows avec PostgreSQL et PostGIS.

## 📋 Prérequis

Avant de commencer, vous devez avoir :

1. **Node.js 18+** - [Télécharger](https://nodejs.org/)
2. **PostgreSQL 15+** - [Télécharger](https://www.postgresql.org/download/windows/)
3. **PostGIS** - [Télécharger](https://postgis.net/windows_downloads/)
4. **Git** - [Télécharger](https://git-scm.com/download/win)

## 🔧 Installation Étape par Étape

### Étape 1 : Installer PostgreSQL

1. Téléchargez PostgreSQL 15 depuis [postgresql.org](https://www.postgresql.org/download/windows/)
2. Lancez l'installateur
3. Suivez l'assistant d'installation :
   - Choisissez un répertoire d'installation (par défaut : `C:\Program Files\PostgreSQL\15`)
   - **IMPORTANT** : Notez le mot de passe que vous définissez pour l'utilisateur `postgres`
   - Port par défaut : `5432` (garde le)
   - Locale : Français, French

### Étape 2 : Installer PostGIS

1. Téléchargez PostGIS pour PostgreSQL 15 depuis [postgis.net](https://postgis.net/windows_downloads/)
2. Lancez l'installateur PostGIS
3. Assurez-vous de sélectionner la même instance PostgreSQL que vous venez d'installer
4. Suivez l'assistant d'installation

### Étape 3 : Créer la Base de Données

1. Ouvrez **pgAdmin 4** (installé avec PostgreSQL)
   - Ou utilisez `psql` depuis l'invite de commande

2. Connectez-vous à PostgreSQL :
   - Serveur : `localhost`
   - Port : `5432`
   - Utilisateur : `postgres`
   - Mot de passe : (celui défini à l'installation)

3. Créez la base de données :
   ```sql
   -- Clic droit sur "Databases" > Create > Database
   -- Ou en SQL :
   CREATE DATABASE gsurvey;
   ```

4. Activez l'extension PostGIS :
   ```sql
   -- Clic droit sur la base "gsurvey" > Query Tool
   -- Ou via psql :
   \c gsurvey
   CREATE EXTENSION postgis;
   
   -- Vérifier l'installation
   SELECT PostGIS_version();
   ```

### Étape 4 : Cloner le Projet

```powershell
# Ouvrir PowerShell dans le dossier où vous voulez le projet
cd C:\Projets

# Cloner le repository
git clone <votre-repo-url>
cd g-survey
```

### Étape 5 : Installer les Dépendances Node.js

```powershell
# Installer les dépendances
npm install

# Si erreur, essayer avec :
npm install --legacy-peer-deps
```

### Étape 6 : Configurer l'Environnement

1. Créez un fichier `.env` à la racine du projet :

```env
# Port du serveur backend
PORT=5000

# Environnement
NODE_ENV=development

# Configuration PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gsurvey
POSTGRES_USER=postgres
POSTGRES_PASSWORD=votre_mot_de_passe_postgres

# JWT Configuration
JWT_SECRET=g-survey-super-secret-jwt-key-2024-change-me-in-production
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Admin User
ADMIN_EMAIL=admin@gsurvey.com
ADMIN_PASSWORD=Admin@123

# Map Configuration (Optionnel)
MAPBOX_TOKEN=your_mapbox_token_here
DEFAULT_MAP_CENTER_LAT=48.8566
DEFAULT_MAP_CENTER_LNG=2.3522
DEFAULT_MAP_ZOOM=6
```

2. **Remplacez** `votre_mot_de_passe_postgres` par le mot de passe que vous avez défini lors de l'installation de PostgreSQL

### Étape 7 : Vérifier le Service PostgreSQL

```powershell
# Vérifier que le service PostgreSQL est démarré
Get-Service postgresql*

# Si le service n'est pas démarré :
Start-Service postgresql-x64-15

# Ou via l'interface graphique :
# Win+R > services.msc > Trouvez "postgresql-x64-15" > Démarrer
```

### Étape 8 : Lancer l'Application

```powershell
# Démarrer le serveur backend et frontend
npm run dev
```

L'application sera accessible sur :
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000

## 🔑 Première Connexion

Utilisez les identifiants administrateur par défaut :
- **Email** : `admin@gsurvey.com`
- **Mot de passe** : `Admin@123`

⚠️ **Important** : Changez ce mot de passe après la première connexion !

## 🐛 Dépannage

### Erreur : "authentification par mot de passe échouée"

**Cause** : Le mot de passe dans `.env` ne correspond pas au mot de passe PostgreSQL.

**Solution** :
1. Vérifiez le mot de passe dans `.env` correspond à celui de PostgreSQL
2. Réinitialisez le mot de passe si nécessaire :
   ```sql
   ALTER USER postgres WITH PASSWORD 'nouveau_mot_de_passe';
   ```
   Mettez à jour `.env` avec le nouveau mot de passe

### Erreur : "PostGIS extension not found"

**Solution** :
1. Vérifiez que PostGIS est bien installé
2. Connectez-vous à la base `gsurvey` :
   ```sql
   \c gsurvey
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

### Erreur : "Port 5432 already in use"

**Cause** : Une autre instance de PostgreSQL utilise le port 5432.

**Solution** :
1. Trouvez le processus :
   ```powershell
   netstat -ano | findstr :5432
   ```
2. Ou changez le port dans `.env` et dans la configuration PostgreSQL

### Le service PostgreSQL ne démarre pas

**Solution** :
1. Ouvrez `services.msc`
2. Trouvez le service `postgresql-x64-15`
3. Clic droit > Propriétés
4. Vérifiez le chemin d'exécution
5. Redémarrez le service

### Erreur : "Cannot find module 'pg'"

**Solution** :
```powershell
npm install pg pg-hstore sequelize
```

## 📚 Ressources Utiles

- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Documentation PostGIS](https://postgis.net/documentation/)
- [Documentation Sequelize](https://sequelize.org/docs/v6/)

## ✅ Vérification de l'Installation

Pour vérifier que tout fonctionne :

1. ✅ PostgreSQL service démarré
2. ✅ Base de données `gsurvey` créée
3. ✅ Extension PostGIS activée
4. ✅ Fichier `.env` configuré
5. ✅ Dépendances npm installées
6. ✅ Application démarre sans erreur
7. ✅ Connexion admin fonctionne

## 🚀 Prochaines Étapes

Une fois l'installation terminée :

1. Consultez le [README.md](./README.md) pour la documentation complète
2. Suivez le [QUICK_START.md](./QUICK_START.md) pour créer votre premier sondage
3. Explorez les fonctionnalités de l'application

---

**Besoin d'aide ?** Consultez [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) pour plus de solutions.


