# 📊 G-Survey - Plateforme de Sondages Avancée

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Plateforme complète de gestion de sondages avec géolocalisation, analytics en temps réel, et système de gestion des rôles. Développée pour le projet de soutenance SIMPLON.

## ✨ Fonctionnalités Principales

### 🔐 Gestion des Rôles & Permissions
- **Administrateur** : Accès complet à tous les sondages et données
- **Superviseur** : Gestion des équipes et accès aux sondages assignés
- **Agent de terrain** : Collecte de données sur le terrain

### 📋 Module de Création de Questionnaires
- **Interface Drag & Drop** intuitive pour construire des questionnaires
- **Types de questions variés** :
  - Informations personnelles (nom, email, téléphone)
  - Métriques de satisfaction : NPS (0-10), CSAT (1-5 étoiles), CES (1-7)
  - Géolocalisation automatique
  - Mesure de superficie en hectares
  - Choix multiple, cases à cocher, échelles, dates, etc.
- Logique conditionnelle (affichage conditionnel des questions)
- Validation en temps réel
- Prévisualisation mobile

### 📊 Tableau de Bord & Analytics
- Vue d'ensemble avec statistiques clés
- Graphiques interactifs (Bar, Doughnut, Line charts)
- Analyse NPS détaillée avec segmentation Promoteurs/Passifs/Détracteurs
- Visualisation CSAT et CES
- Filtrage par période (jour, semaine, mois, année)
- Rapports de comparaison entre sondages

### 🗺️ Vue Cartographique Temps Réel
- Affichage des réponses géolocalisées sur carte interactive
- Clustering automatique des points proches
- Marqueurs colorés selon le score NPS
- Popups détaillées avec informations complètes
- Filtrage par type de répondant (promoteurs, passifs, détracteurs)
- Heatmap des zones d'activité

### 📈 Rapports & Exports
- Export Excel avec graphiques
- Export CSV pour analyse externe
- Export JSON pour intégrations API
- Génération de rapports automatiques

### 🔧 Fonctionnalités Techniques
- Interface responsive (desktop, tablette, mobile)
- Mode sombre/clair
- Synchronisation hors-ligne pour agents terrain
- Sauvegarde automatique des réponses
- API REST complète

## 🛠️ Stack Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Styling moderne
- **Zustand** - State management
- **React Router** - Navigation
- **Chart.js & Recharts** - Visualisations
- **Leaflet** - Cartographie
- **dnd-kit** - Drag & Drop

### Backend
- **Node.js** avec Express
- **PostgreSQL** avec **PostGIS** - Base de données relationnelle et géospatiale
- **Sequelize** - ORM
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe
- **XLSX** - Export Excel

## 📦 Installation

### Prérequis
- Node.js 18+ et npm
- PostgreSQL 15+ avec extension PostGIS
- Git

### 1. Cloner le projet
```bash
git clone https://github.com/votre-repo/g-survey.git
cd g-survey
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Installer PostgreSQL avec PostGIS

#### Sur Windows :
1. Téléchargez PostgreSQL depuis [postgresql.org](https://www.postgresql.org/download/windows/)
2. Installez PostgreSQL 15 ou supérieur
3. Pendant l'installation, notez le mot de passe du superutilisateur `postgres`
4. Installez l'extension PostGIS :
   - Téléchargez depuis [postgis.net](https://postgis.net/windows_downloads/)
   - Installez PostGIS dans votre instance PostgreSQL

#### Créer la base de données :
```sql
-- Se connecter à PostgreSQL
psql -U postgres

-- Créer la base de données
CREATE DATABASE gsurvey;

-- Se connecter à la base
\c gsurvey

-- Activer l'extension PostGIS
CREATE EXTENSION postgis;
```

### 4. Configuration de l'environnement
Le fichier `.env` doit contenir :
```env
PORT=5000
NODE_ENV=development
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gsurvey
POSTGRES_USER=postgres
POSTGRES_PASSWORD=votre_mot_de_passe_postgres
JWT_SECRET=g-survey-super-secret-jwt-key-2024
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@gsurvey.com
ADMIN_PASSWORD=Admin@123
CLIENT_URL=http://localhost:5173
```

### 5. Lancer l'application
```bash
# Démarre le serveur backend ET le frontend en parallèle
npm run dev
```

L'application sera accessible sur :
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000

## 🚀 Utilisation

### Première Connexion
1. Ouvrez http://localhost:5173
2. Connectez-vous avec les identifiants admin :
   - Email : `admin@gsurvey.com`
   - Mot de passe : `Admin@123`

### Créer un Sondage
1. Cliquez sur **"📋 Sondages"** dans le menu
2. Cliquez sur **"➕ Créer un Sondage"**
3. Remplissez les informations de base
4. Ajoutez des questions avec le drag & drop
5. Configurez les paramètres
6. Cliquez sur **"🚀 Activer le sondage"**

### Répondre à un Sondage
1. Ouvrez un sondage actif
2. Cliquez sur **"📝 Répondre au sondage"**
3. Répondez aux questions
4. La géolocalisation sera demandée si activée
5. Cliquez sur **"✓ Soumettre"**

### Analyser les Résultats
1. Ouvrez un sondage
2. Cliquez sur **"📊 Analytics"**
3. Consultez les graphiques et statistiques
4. Exportez les données (Excel, CSV, JSON)

### Visualiser sur la Carte
1. Ouvrez un sondage
2. Cliquez sur **"🗺️ Vue cartographique"**
3. Filtrez par type de répondant
4. Cliquez sur les marqueurs pour voir les détails

### Gérer les Utilisateurs (Admin)
1. Cliquez sur **"👥 Utilisateurs"** dans le menu
2. Cliquez sur **"➕ Nouvel Utilisateur"**
3. Remplissez le formulaire
4. Sélectionnez le rôle approprié
5. Cliquez sur **"Créer"**

## 📱 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Créer un utilisateur (admin)
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/update-profile` - Modifier profil
- `PUT /api/auth/change-password` - Changer mot de passe

### Sondages
- `GET /api/surveys` - Liste des sondages
- `GET /api/surveys/:id` - Détails d'un sondage
- `POST /api/surveys` - Créer un sondage
- `PUT /api/surveys/:id` - Modifier un sondage
- `DELETE /api/surveys/:id` - Supprimer un sondage
- `PUT /api/surveys/:id/status` - Changer le statut
- `POST /api/surveys/:id/assign` - Assigner à des utilisateurs

### Réponses
- `GET /api/responses` - Liste des réponses
- `GET /api/responses/:id` - Détails d'une réponse
- `POST /api/responses` - Soumettre une réponse
- `GET /api/responses/survey/:id` - Réponses d'un sondage
- `GET /api/responses/survey/:id/map` - Réponses géolocalisées
- `POST /api/responses/bulk` - Synchronisation hors-ligne

### Analytics
- `GET /api/analytics/survey/:id` - Analytics d'un sondage
- `GET /api/analytics/dashboard` - Statistiques du tableau de bord
- `GET /api/analytics/comparison` - Comparer des sondages

### Exports
- `GET /api/exports/survey/:id/excel` - Export Excel
- `GET /api/exports/survey/:id/csv` - Export CSV
- `GET /api/exports/survey/:id/json` - Export JSON

## 🎨 Architecture

```
g-survey/
├── server/                 # Backend Node.js/Express
│   ├── config/            # Configuration DB
│   ├── models/            # Modèles Sequelize (PostgreSQL)
│   ├── routes/            # Routes API
│   ├── middleware/        # Middlewares (auth, etc.)
│   └── index.js          # Point d'entrée serveur
├── src/                   # Frontend React
│   ├── components/        # Composants réutilisables
│   ├── layouts/          # Layouts (Main, Auth)
│   ├── pages/            # Pages de l'application
│   ├── services/         # Services API
│   ├── store/            # State management (Zustand)
│   ├── App.tsx           # Composant racine
│   └── main.tsx          # Point d'entrée React
├── public/               # Assets statiques
└── package.json          # Dépendances

```

## 🔒 Sécurité

- Authentification JWT avec tokens sécurisés
- Hashage des mots de passe avec bcrypt
- Validation des données côté serveur
- Protection CORS configurée
- Gestion des rôles et permissions
- Endpoints protégés par middleware d'authentification

## 📊 Métriques Supportées

### NPS (Net Promoter Score)
- Échelle de 0 à 10
- Calcul : % Promoteurs (9-10) - % Détracteurs (0-6)
- Segmentation automatique en 3 catégories

### CSAT (Customer Satisfaction)
- Échelle de 1 à 5 étoiles
- Moyenne calculée automatiquement
- Distribution graphique

### CES (Customer Effort Score)
- Échelle de 1 à 7
- Mesure la facilité d'utilisation
- Analyse comparative

## 🌐 Mode Hors-Ligne

Les agents de terrain peuvent :
- Télécharger les sondages pour consultation hors-ligne
- Collecter des réponses sans connexion
- Synchroniser automatiquement lors du retour en ligne

## 📱 Responsive Design

L'interface s'adapte à tous les écrans :
- **Desktop** : Vue complète avec sidebar
- **Tablette** : Layout optimisé
- **Mobile** : Interface tactile adaptée pour la collecte terrain

## 🤝 Contribution

Ce projet a été développé dans le cadre d'une soutenance SIMPLON.

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails

## 👨‍💻 Auteur

Développé avec ❤️ pour SIMPLON

---

**Note** : Pour toute question ou problème, consultez la documentation ou créez une issue sur GitHub.
