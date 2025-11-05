# 📚 Documentation Technique - G-Survey

## Guide Complet pour la Soutenance

---

## Table des Matières

1. [Pourquoi React et Node.js ?](#1-pourquoi-react-et-nodejs)
2. [Fonctions Importantes du Projet](#2-fonctions-importantes-du-projet)
3. [Structure MVC et Organisation du Code](#3-structure-mvc-et-organisation-du-code)
4. [Architecture Backend-Frontend](#4-architecture-backend-frontend)
5. [Base de Données : Relations et Choix de PostgreSQL/PostGIS](#5-base-de-données-relations-et-choix-de-postgresqlpostgis)

---

## 1. Pourquoi React et Node.js ?

### 1.1 Pourquoi React pour le Frontend ?

**React** est une bibliothèque JavaScript développée par Facebook pour créer des interfaces utilisateur interactives. Voici pourquoi nous l'avons choisi :

#### ✅ **Avantages de React :**

1. **Composants Réutilisables**
   - Permet de créer des composants (boutons, formulaires, cartes) une fois et de les réutiliser partout
   - Exemple : Le composant `SurveyBuilder` peut être utilisé pour créer ET modifier un sondage

2. **Interface Réactive**
   - Mise à jour automatique de l'interface quand les données changent
   - L'utilisateur voit immédiatement ses modifications sans recharger la page

3. **Écosystème Riche**
   - Beaucoup de bibliothèques disponibles (React Router pour la navigation, Zustand pour la gestion d'état)
   - Communauté active et documentation complète

4. **Performance**
   - Utilise un "Virtual DOM" qui optimise les mises à jour
   - Rendu rapide même avec beaucoup de données

5. **TypeScript**
   - Nous utilisons TypeScript avec React pour détecter les erreurs avant l'exécution
   - Code plus sûr et plus facile à maintenir

#### 📁 **Exemple dans notre projet :**
```typescript
// src/components/SurveyBuilder.tsx
// Ce composant peut être réutilisé pour créer ou modifier un sondage
```

### 1.2 Pourquoi Node.js pour le Backend ?

**Node.js** permet d'exécuter JavaScript côté serveur. Voici pourquoi c'est idéal pour notre projet :

#### ✅ **Avantages de Node.js :**

1. **Même Langage (JavaScript)**
   - Frontend (React) et Backend (Node.js) utilisent le même langage
   - Plus facile à maintenir et à comprendre
   - Un développeur peut travailler sur les deux parties

2. **Express.js**
   - Framework web léger et rapide pour créer des APIs REST
   - Facile à configurer et à étendre

3. **Performance**
   - Architecture asynchrone (non-bloquante)
   - Gère bien les requêtes simultanées
   - Parfait pour une application avec beaucoup d'utilisateurs

4. **Écosystème NPM**
   - Accès à des milliers de packages (bcrypt pour le hashage, JWT pour l'authentification, Sequelize pour la base de données)

5. **Scalabilité**
   - Facile d'ajouter de nouvelles fonctionnalités
   - Supporte bien la croissance de l'application

#### 📁 **Exemple dans notre projet :**
```javascript
// server/index.js
// Point d'entrée du serveur Express
```

---

## 2. Fonctions Importantes du Projet

### 2.1 Authentification et Sécurité

#### 🔐 **Hashage des Mots de Passe (bcrypt)**
```javascript
// server/routes/auth.js - Ligne 67
const hashedPassword = await bcrypt.hash(password, 10);
```
- **Pourquoi ?** Les mots de passe ne sont JAMAIS stockés en clair
- **Comment ?** bcrypt transforme le mot de passe en une chaîne cryptée irréversible
- **Sécurité :** Même si la base de données est compromise, les mots de passe restent protégés

#### 🎫 **JWT (JSON Web Tokens)**
```javascript
// server/routes/auth.js - Ligne 14-18
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};
```
- **Pourquoi ?** Permet de vérifier l'identité de l'utilisateur sans stocker de session
- **Comment ?** Le serveur génère un token après connexion, le client l'envoie à chaque requête
- **Avantage :** Stateless (pas besoin de stocker les sessions côté serveur)

#### 🛡️ **Middleware de Protection**
```javascript
// server/middleware/auth.js
// Vérifie que l'utilisateur est authentifié avant d'accéder aux routes protégées
```
- **Fonction :** Vérifie le token JWT avant d'autoriser l'accès
- **Utilisation :** Toutes les routes privées (création de sondage, réponses, etc.)

### 2.2 Gestion des Sondages

#### 📝 **Création de Sondage**
```javascript
// server/routes/surveys.js - Ligne 108-233
router.post('/', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  // Crée un nouveau sondage avec validation des données
});
```
- **Fonctionnalités :**
  - Validation des questions
  - Nettoyage des données (sécurité)
  - Attribution automatique au créateur
  - Notification des administrateurs

#### 🔄 **Fermeture Automatique**
```javascript
// server/models/Survey.js - Ligne 145-185
Survey.closeExpiredSurveys = async function() {
  // Ferme automatiquement les sondages dont la date de fin est dépassée
};
```
- **Fonction :** Vérifie et ferme automatiquement les sondages expirés
- **Avantage :** Pas besoin d'intervention manuelle

### 2.3 Gestion des Réponses

#### 📍 **Géolocalisation (PostGIS)**
```javascript
// server/models/Response.js - Ligne 58
location: {
  type: DataTypes.GEOMETRY('POINT'),
  allowNull: true
}
```
- **Fonction :** Stocke les coordonnées GPS des réponses
- **Utilisation :** Affichage sur la carte, analyse géographique

#### 📊 **Calcul Automatique des Scores**
```javascript
// server/models/Response.js - Ligne 121-133
Response.beforeSave((response, options) => {
  // Calcule automatiquement les scores NPS, CSAT, CES
});
```
- **Fonction :** Extrait et calcule les scores de satisfaction depuis les réponses
- **Avantage :** Données prêtes pour l'analyse

### 2.4 Notifications

#### 🔔 **Système de Notifications**
```javascript
// server/routes/notifications.js
// Gère les notifications pour :
// - Attribution de sondage
// - Nouvelle réponse
// - Nouvel utilisateur inscrit
// - Fermeture de sondage
```
- **Fonction :** Informe les utilisateurs des événements importants
- **Types :** Assignation, réponse soumise, inscription, etc.

### 2.5 Export de Données

#### 📥 **Export Multi-Formats**
```javascript
// server/routes/exports.js
// Exporte les données en :
// - Excel (.xlsx)
// - PDF
// - CSV
```
- **Fonction :** Permet de télécharger les résultats des sondages
- **Formats :** Excel, PDF, CSV pour différents besoins d'analyse

---

## 3. Structure MVC et Organisation du Code

### 3.1 Qu'est-ce que le Pattern MVC ?

**MVC** signifie **Model-View-Controller** :
- **Model (Modèle)** : Gère les données et la logique métier
- **View (Vue)** : Affiche les données à l'utilisateur
- **Controller (Contrôleur)** : Gère les interactions entre le Model et la View

Dans notre projet, nous utilisons une **architecture MVC adaptée** :

### 3.2 Structure du Backend (Node.js/Express)

```
server/
├── config/              # Configuration
│   └── database.js      # Configuration de la connexion PostgreSQL
│
├── models/              # MODELS (Modèles de données)
│   ├── index.js         # Associations entre les modèles
│   ├── User.js          # Modèle Utilisateur
│   ├── Survey.js        # Modèle Sondage
│   ├── Response.js      # Modèle Réponse
│   ├── Team.js          # Modèle Équipe
│   └── Notification.js  # Modèle Notification
│
├── routes/              # CONTROLLERS (Gestion des requêtes)
│   ├── auth.js          # Routes d'authentification
│   ├── surveys.js       # Routes des sondages
│   ├── responses.js     # Routes des réponses
│   ├── analytics.js     # Routes des statistiques
│   ├── exports.js       # Routes d'export
│   ├── uploads.js       # Routes de téléchargement
│   └── notifications.js # Routes des notifications
│
├── middleware/          # Middleware (Fonctions intermédiaires)
│   ├── auth.js          # Vérification de l'authentification
│   └── errorHandler.js  # Gestion des erreurs
│
├── services/            # Services (Logique métier)
│   ├── emailService.js  # Service d'envoi d'emails
│   └── cloudinary.js    # Service de stockage d'images
│
└── index.js             # Point d'entrée du serveur
```

#### 📁 **Détail de chaque dossier :**

##### **`server/config/`** - Configuration
- **`database.js`** : Configure la connexion à PostgreSQL avec Sequelize
  - Gère la connexion à la base de données
  - Active l'extension PostGIS
  - Crée l'admin par défaut

##### **`server/models/`** - Modèles (Models)
- **`User.js`** : Définit la structure de la table `users`
  - Champs : email, password, role, teamId, etc.
  - Validations : email unique, mot de passe requis
- **`Survey.js`** : Définit la structure de la table `surveys`
  - Champs : title, questions (JSONB), status, dates
  - Méthodes : `closeExpiredSurveys()` pour fermer automatiquement
- **`Response.js`** : Définit la structure de la table `responses`
  - Champs : answers (JSONB), location (GEOMETRY), scores
  - Hooks : Calcule automatiquement les scores avant sauvegarde
- **`Team.js`** : Définit la structure de la table `teams`
  - Champs : name, supervisorId, description
- **`Notification.js`** : Définit la structure de la table `notifications`
  - Champs : type, message, userId, isRead
- **`index.js`** : Définit les **associations** entre les modèles
  - User ↔ Team (belongsTo/hasMany)
  - Survey ↔ User (belongsToMany pour les assignations)
  - Response ↔ Survey (belongsTo/hasMany)

##### **`server/routes/`** - Contrôleurs (Controllers)
- **`auth.js`** : Gère l'authentification
  - POST `/api/auth/register` : Inscription
  - POST `/api/auth/login` : Connexion
  - GET `/api/auth/me` : Récupère l'utilisateur connecté
  - PUT `/api/auth/update-profile` : Met à jour le profil
- **`surveys.js`** : Gère les sondages
  - GET `/api/surveys` : Liste des sondages
  - POST `/api/surveys` : Créer un sondage
  - PUT `/api/surveys/:id` : Modifier un sondage
  - POST `/api/surveys/:id/assign` : Assigner un sondage
- **`responses.js`** : Gère les réponses
  - POST `/api/responses` : Soumettre une réponse
  - GET `/api/responses/survey/:id` : Récupérer les réponses d'un sondage
- **`analytics.js`** : Gère les statistiques
  - GET `/api/analytics/survey/:id` : Statistiques d'un sondage
- **`exports.js`** : Gère les exports
  - GET `/api/exports/survey/:id/excel` : Export Excel
  - GET `/api/exports/survey/:id/pdf` : Export PDF
- **`notifications.js`** : Gère les notifications
  - GET `/api/notifications` : Liste des notifications
  - PUT `/api/notifications/:id/read` : Marquer comme lu

##### **`server/middleware/`** - Middleware
- **`auth.js`** : Middleware de protection
  - `protect` : Vérifie que l'utilisateur est authentifié
  - `authorize` : Vérifie le rôle (admin, supervisor, field_agent)
  - `canAccessSurvey` : Vérifie l'accès à un sondage spécifique
- **`errorHandler.js`** : Gestion centralisée des erreurs
  - Capture toutes les erreurs
  - Retourne des messages d'erreur formatés

##### **`server/services/`** - Services
- **`emailService.js`** : Service d'envoi d'emails
  - `sendWelcomeEmail()` : Email de bienvenue
  - `sendResetPasswordEmail()` : Email de réinitialisation
- **`cloudinary.js`** : Service de stockage d'images
  - Upload et gestion des images

### 3.3 Structure du Frontend (React/TypeScript)

```
src/
├── components/          # Composants réutilisables
│   ├── Header.tsx      # En-tête de l'application
│   ├── Sidebar.tsx     # Menu latéral
│   ├── SurveyBuilder.tsx # Constructeur de sondage
│   ├── ProtectedRoute.tsx # Protection des routes
│   └── ...
│
├── pages/              # Pages (Views)
│   ├── Landing.tsx     # Page d'accueil
│   ├── Dashboard.tsx   # Tableau de bord
│   ├── auth/           # Pages d'authentification
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ...
│   ├── surveys/        # Pages des sondages
│   │   ├── SurveyList.tsx
│   │   ├── SurveyCreate.tsx
│   │   └── ...
│   └── ...
│
├── services/           # Services API (Communication avec le backend)
│   ├── api.ts          # Configuration Axios
│   ├── authService.ts  # Appels API d'authentification
│   ├── surveyService.ts # Appels API des sondages
│   └── ...
│
├── store/              # Gestion d'état (Zustand)
│   └── authStore.ts    # Store d'authentification
│
├── layouts/            # Layouts (Mises en page)
│   ├── MainLayout.tsx  # Layout principal (avec sidebar)
│   └── AuthLayout.tsx  # Layout pour l'authentification
│
├── utils/              # Utilitaires
│   ├── navigation.ts   # Fonctions de navigation
│   └── logger.ts       # Logging
│
└── App.tsx             # Composant racine (Routes)
```

#### 📁 **Détail de chaque dossier :**

##### **`src/components/`** - Composants Réutilisables
- **`Header.tsx`** : En-tête avec logo, menu utilisateur, notifications
- **`Sidebar.tsx`** : Menu de navigation latéral
- **`SurveyBuilder.tsx`** : Constructeur de sondage (drag & drop)
- **`ProtectedRoute.tsx`** : Composant qui protège les routes privées
- **`NotificationDropdown.tsx`** : Liste déroulante des notifications

##### **`src/pages/`** - Pages (Vues)
- **`Landing.tsx`** : Page d'accueil publique
- **`Dashboard.tsx`** : Tableau de bord avec statistiques
- **`auth/Login.tsx`** : Page de connexion
- **`auth/Register.tsx`** : Page d'inscription
- **`surveys/SurveyList.tsx`** : Liste des sondages
- **`surveys/SurveyCreate.tsx`** : Création de sondage
- **`surveys/SurveyRespond.tsx`** : Répondre à un sondage
- **`MapView.tsx`** : Visualisation des réponses sur une carte
- **`Analytics.tsx`** : Graphiques et statistiques

##### **`src/services/`** - Services API
- **`api.ts`** : Configuration Axios (client HTTP)
  - Base URL
  - Intercepteurs pour gérer les erreurs 401 (déconnexion)
- **`authService.ts`** : Fonctions d'authentification
  - `login()`, `register()`, `logout()`, `getCurrentUser()`
- **`surveyService.ts`** : Fonctions des sondages
  - `getSurveys()`, `createSurvey()`, `updateSurvey()`, `deleteSurvey()`
- **`responseService.ts`** : Fonctions des réponses
  - `submitResponse()`, `getResponses()`
- **`analyticsService.ts`** : Fonctions des statistiques
  - `getAnalytics()`, `getSurveyStats()`

##### **`src/store/`** - Gestion d'État
- **`authStore.ts`** : Store Zustand pour l'authentification
  - Stocke l'utilisateur connecté
  - Fonctions : `login()`, `logout()`, `checkAuth()`
  - Accessible dans toute l'application

##### **`src/layouts/`** - Layouts
- **`MainLayout.tsx`** : Layout principal avec Header et Sidebar
- **`AuthLayout.tsx`** : Layout simple pour les pages d'authentification

##### **`src/App.tsx`** - Point d'Entrée
- Configure toutes les routes de l'application
- Gère la navigation et la protection des routes

### 3.4 Flux de Données MVC dans notre Projet

```
1. UTILISATEUR → Frontend (React)
   ↓
2. ACTION (clic, formulaire) → Service API (authService.ts)
   ↓
3. REQUÊTE HTTP → Backend (Express)
   ↓
4. ROUTE (routes/auth.js) → Middleware (auth.js) → Vérification
   ↓
5. CONTROLLER → MODEL (User.js) → Base de Données (PostgreSQL)
   ↓
6. RÉPONSE → Frontend → AFFICHAGE (Page React)
```

**Exemple concret : Connexion**

1. **View (Frontend)** : `src/pages/auth/Login.tsx`
   - L'utilisateur saisit email et mot de passe
   - Clic sur "Se connecter"

2. **Service** : `src/services/authService.ts`
   ```typescript
   const response = await api.post('/auth/login', { email, password });
   ```

3. **Route (Backend)** : `server/routes/auth.js`
   ```javascript
   router.post('/login', async (req, res) => {
     // Vérifie les identifiants
     // Génère un token JWT
   });
   ```

4. **Model** : `server/models/User.js`
   - Vérifie si l'utilisateur existe
   - Compare le mot de passe hashé

5. **Base de Données** : PostgreSQL
   - Requête SQL pour trouver l'utilisateur

6. **Réponse** : Retourne le token JWT au frontend

7. **Frontend** : Stocke le token et redirige vers le Dashboard

---

## 4. Architecture Backend-Frontend

### 4.1 Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Services   │      │
│  │  (Views)     │  │  (UI)         │  │   (API)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                 │
│                    ┌───────▼───────┐                        │
│                    │  Axios Client │                        │
│                    │  (HTTP Client)│                        │
│                    └───────┬───────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   HTTP/HTTPS    │
                    │   (REST API)    │
                    └────────┬────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                      BACKEND (Node.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │  Middleware   │  │   Models     │      │
│  │ (Controllers)│  │  (Auth, etc.) │  │  (Sequelize) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                 │
│                    ┌───────▼───────┐                        │
│                    │   Sequelize   │                        │
│                    │   (ORM)       │                        │
│                    └───────┬───────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   + PostGIS     │
                    └─────────────────┘
```

### 4.2 Communication Frontend ↔ Backend

#### **Protocole : REST API (Representational State Transfer)**

Le frontend et le backend communiquent via des **requêtes HTTP** :

- **GET** : Récupérer des données
- **POST** : Créer des données
- **PUT** : Modifier des données
- **DELETE** : Supprimer des données

#### **Exemple : Créer un Sondage**

**1. Frontend (React) :**
```typescript
// src/services/surveyService.ts
export const createSurvey = async (surveyData: SurveyData) => {
  const response = await api.post('/surveys', surveyData);
  return response.data;
};
```

**2. Requête HTTP :**
```
POST http://localhost:5000/api/surveys
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
Body:
  {
    "title": "Sondage de satisfaction",
    "questions": [...],
    "status": "draft"
  }
```

**3. Backend (Express) :**
```javascript
// server/routes/surveys.js
router.post('/', protect, authorize('admin', 'supervisor'), async (req, res) => {
  // 1. Middleware 'protect' vérifie le token JWT
  // 2. Middleware 'authorize' vérifie le rôle
  // 3. Création du sondage
  const survey = await Survey.create(req.body);
  // 4. Retourne la réponse
  res.json({ success: true, data: survey });
});
```

**4. Réponse HTTP :**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "title": "Sondage de satisfaction",
    "status": "draft",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**5. Frontend :** Reçoit la réponse et met à jour l'interface

### 4.3 Authentification et Sécurité

#### **Flux d'Authentification :**

```
1. UTILISATEUR → Login (email + password)
   ↓
2. FRONTEND → POST /api/auth/login
   ↓
3. BACKEND → Vérifie email/password → Génère JWT Token
   ↓
4. BACKEND → Retourne { user, token }
   ↓
5. FRONTEND → Stocke le token dans sessionStorage
   ↓
6. FRONTEND → Ajoute le token dans les headers de toutes les requêtes
   ↓
7. BACKEND → Middleware 'protect' vérifie le token à chaque requête
```

#### **Sécurité des Requêtes :**

**Frontend :**
```typescript
// src/services/api.ts
api.interceptors.request.use((config) => {
  const token = getToken(); // Récupère le token depuis sessionStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Backend :**
```javascript
// server/middleware/auth.js
const protect = async (req, res, next) => {
  // 1. Récupère le token depuis les headers
  const token = req.headers.authorization?.split(' ')[1];
  
  // 2. Vérifie le token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 3. Récupère l'utilisateur
  req.user = await User.findByPk(decoded.id);
  
  // 4. Continue vers la route
  next();
};
```

### 4.4 Gestion des Erreurs

#### **Frontend :**
```typescript
// src/services/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré → Déconnexion
      sessionStorage.removeItem('auth-storage');
      navigateTo('/login');
    }
    return Promise.reject(error);
  }
);
```

#### **Backend :**
```javascript
// server/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Capture toutes les erreurs
  // Retourne un message formaté
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur'
  });
};
```

### 4.5 Proxy de Développement

En développement, Vite utilise un **proxy** pour rediriger les requêtes `/api` vers le backend :

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

**Avantage :** Le frontend (port 5173) et le backend (port 5000) peuvent communiquer sans problème CORS.

---

## 5. Base de Données : Relations et Choix de PostgreSQL/PostGIS

### 5.1 Pourquoi PostgreSQL au lieu d'une Base de Données NoSQL ?

#### ✅ **Avantages de PostgreSQL :**

1. **Relations et Intégrité Référentielle**
   - Garantit la cohérence des données
   - Exemple : Impossible de supprimer un utilisateur s'il a des sondages
   - Les clés étrangères maintiennent les relations

2. **Transactions ACID**
   - **Atomicité** : Toutes les opérations réussissent ou échouent ensemble
   - **Cohérence** : Les données restent valides
   - **Isolation** : Les transactions ne se chevauchent pas
   - **Durabilité** : Les données sont sauvegardées

3. **Requêtes Complexes**
   - Supporte les JOINs, agrégations, sous-requêtes
   - Parfait pour les statistiques et analyses

4. **Type de Données Avancés**
   - **JSONB** : Stocke des données JSON avec indexation
   - **UUID** : Identifiants uniques
   - **ENUM** : Types énumérés (roles, status)
   - **GEOMETRY** : Données géographiques (avec PostGIS)

5. **Performance**
   - Indexation avancée
   - Optimisation des requêtes
   - Supporte de grandes quantités de données

#### ❌ **Pourquoi pas NoSQL (MongoDB) ?**

- **Pas de relations garanties** : Risque d'incohérence
- **Pas de transactions complexes** : Difficile pour les opérations multiples
- **Pas de support géographique natif** : PostGIS est plus puissant

### 5.2 Pourquoi PostGIS ?

**PostGIS** est une extension de PostgreSQL pour les données géographiques.

#### ✅ **Avantages de PostGIS :**

1. **Types Géographiques**
   - **POINT** : Coordonnées GPS (latitude, longitude)
   - **POLYGON** : Zones géographiques
   - **LINESTRING** : Lignes (routes, frontières)

2. **Fonctions Spatiales**
   - Calcul de distances
   - Recherche dans un rayon
   - Intersections géographiques
   - Calculs de surfaces

3. **Indexation Spatiale (GIST)**
   - Recherche rapide de points proches
   - Requêtes géographiques optimisées

#### 📍 **Utilisation dans notre Projet :**

```javascript
// server/models/Response.js
location: {
  type: DataTypes.GEOMETRY('POINT'),
  allowNull: true
}
```

**Exemple de requête PostGIS :**
```sql
-- Trouver toutes les réponses dans un rayon de 10 km
SELECT * FROM responses
WHERE ST_DWithin(
  location,
  ST_MakePoint(-1.5536, 47.2184), -- Coordonnées du centre
  10000 -- 10 km en mètres
);
```

### 5.3 Structure de la Base de Données

#### **Tables Principales :**

1. **`users`** - Utilisateurs
2. **`teams`** - Équipes
3. **`surveys`** - Sondages
4. **`survey_assignees`** - Table de liaison (Many-to-Many)
5. **`responses`** - Réponses
6. **`notifications`** - Notifications

### 5.4 Relations entre les Tables

#### **Diagramme Complet des Relations (ER Diagram) :**

```
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                    DIAGRAMME ENTITÉ-RELATION (ER)                                           ║
║                                      BASE DE DONNÉES G-SURVEY                                               ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          TABLE: users                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ id (PK, UUID)                    │  Identifiant unique de l'utilisateur                           │  │
│  │ email (UNIQUE, STRING)           │  Email de l'utilisateur (unique)                                 │  │
│  │ password (STRING)                │  Mot de passe hashé (bcrypt)                                     │  │
│  │ firstName (STRING)               │  Prénom                                                         │  │
│  │ lastName (STRING)                 │  Nom                                                            │  │
│  │ username (UNIQUE, STRING)        │  Nom d'utilisateur (unique, optionnel)                          │  │
│  │ role (ENUM)                      │  Rôle: 'admin', 'supervisor', 'field_agent'                     │  │
│  │ teamId (FK → teams.id)           │  Équipe à laquelle appartient l'utilisateur (nullable)          │  │
│  │ isActive (BOOLEAN)               │  Compte actif ou désactivé                                      │  │
│  │ lastLogin (DATE)                 │  Date de dernière connexion                                     │  │
│  │ resetPasswordToken (STRING)     │  Token pour réinitialisation du mot de passe                   │  │
│  │ resetPasswordExpire (DATE)       │  Expiration du token de réinitialisation                       │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │                    │                    │
         │                    │                    │                    │                    │
         │                    │                    │                    │                    │
    ┌────┘                    │                    │                    │                    │
    │ 1:N                      │                    │                    │                    │
    │                          │                    │                    │                    │
    │ (belongsTo)              │                    │                    │                    │
    │                          │                    │                    │                    │
    │                          │                    │                    │                    │
┌───▼───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          TABLE: teams                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ id (PK, UUID)                    │  Identifiant unique de l'équipe                                 │  │
│  │ name (UNIQUE, STRING)            │  Nom de l'équipe (unique)                                     │  │
│  │ description (TEXT)                │  Description de l'équipe                                      │  │
│  │ supervisorId (FK → users.id)    │  Superviseur de l'équipe (nullable)                           │  │
│  │ isActive (BOOLEAN)               │  Équipe active ou désactivée                                   │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │ 1:1
         │ (belongsTo)
         │
         │
         │
    ┌────┘
    │
    │
┌───▼───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          TABLE: users                                                      │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         │ (hasMany)
         │ createdById
         │
         │
    ┌────┘
    │
    │
┌───▼───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          TABLE: surveys                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ id (PK, UUID)                    │  Identifiant unique du sondage                                │  │
│  │ title (STRING)                   │  Titre du sondage                                              │  │
│  │ description (TEXT)                │  Description du sondage                                        │  │
│  │ questions (JSONB)                │  Liste des questions (format JSON)                              │  │
│  │ status (ENUM)                    │  Statut: 'draft', 'active', 'paused', 'closed'                │  │
│  │ createdById (FK → users.id)      │  Créateur du sondage (NOT NULL)                                │  │
│  │ startDate (DATE)                 │  Date de début                                                 │  │
│  │ endDate (DATE)                   │  Date de fin                                                   │  │
│  │ originalEndDate (DATE)           │  Date de fin originale (pour historique)                       │  │
│  │ autoClosedAt (DATE)              │  Date de fermeture automatique                                 │  │
│  │ targetResponses (INTEGER)        │  Nombre de réponses ciblées                                    │  │
│  │ responseCount (INTEGER)           │  Nombre actuel de réponses                                     │  │
│  │ settings (JSONB)                 │  Paramètres du sondage (JSON)                                   │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
         │                    │
         │                    │
         │                    │
         │ N:M                │ 1:N
         │                    │ (hasMany)
         │                    │
         │                    │
    ┌────┴────┐                │
    │        │                │
    │        │                │
    │        │                │
┌───▼────────▼─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  TABLE: survey_assignees (Table de liaison Many-to-Many)                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ surveyId (FK → surveys.id, PK)   │  Identifiant du sondage                                        │  │
│  │ userId (FK → users.id, PK)        │  Identifiant de l'utilisateur assigné                        │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│  Note: Clé primaire composite (surveyId + userId)                                                       │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │
         │
         │
┌─────────┴───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          TABLE: users                                                      │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │
         │
         │ 1:N
         │ (hasMany)
         │ surveyId
         │
         │
    ┌────┘
    │
    │
┌───▼───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          TABLE: responses                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ id (PK, UUID)                    │  Identifiant unique de la réponse                               │  │
│  │ surveyId (FK → surveys.id)      │  Sondage auquel appartient la réponse (NOT NULL)                │  │
│  │ respondentId (FK → users.id)    │  Utilisateur qui a soumis la réponse (nullable - anonyme OK)   │  │
│  │ answers (JSONB)                  │  Réponses aux questions (format JSON)                           │  │
│  │ location (GEOMETRY POINT)        │  Coordonnées GPS (PostGIS) - nullable                           │  │
│  │ deviceInfo (JSONB)               │  Informations sur l'appareil (navigateur, OS, etc.)             │  │
│  │ metadata (JSONB)                 │  Métadonnées supplémentaires                                    │  │
│  │ npsScore (INTEGER 0-10)          │  Score NPS si applicable                                       │  │
│  │ csatScore (INTEGER 1-5)          │  Score CSAT si applicable                                     │  │
│  │ cesScore (INTEGER 1-7)            │  Score CES si applicable                                      │  │
│  │ status (ENUM)                    │  Statut: 'completed', 'partial', 'synced', 'pending_sync'      │  │
│  │ submittedAt (DATE)               │  Date de soumission                                           │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│  Indexes:                                                                                                 │
│    - surveyId (pour recherche rapide par sondage)                                                       │
│    - respondentId (pour recherche rapide par utilisateur)                                               │
│    - location (GIST index pour recherche géographique PostGIS)                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │
         │
         │ 1:N
         │ (belongsTo)
         │ respondentId
         │
         │
    ┌────┘
    │
    │
┌───▼───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          TABLE: users                                                      │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         │                    │                    │
    ┌────┘                    │                    │
    │ 1:N                     │                    │
    │ (hasMany)               │                    │
    │ userId                  │                    │
    │                         │                    │
    │                         │                    │
┌───▼───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          TABLE: notifications                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ id (PK, UUID)                    │  Identifiant unique de la notification                          │  │
│  │ type (ENUM)                      │  Type: 'survey_assigned', 'survey_completed', etc.              │  │
│  │ title (STRING)                   │  Titre de la notification                                     │  │
│  │ message (TEXT)                   │  Message de la notification                                   │  │
│  │ userId (FK → users.id)           │  Utilisateur destinataire (NOT NULL)                           │  │
│  │ relatedUserId (FK → users.id)    │  Utilisateur qui a déclenché l'action (nullable)                │  │
│  │ relatedSurveyId (FK → surveys.id)│  Sondage concerné (nullable)                                  │  │
│  │ isRead (BOOLEAN)                 │  Notification lue ou non                                       │  │
│  │ link (STRING)                    │  Lien vers la ressource concernée                              │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│  Indexes:                                                                                                 │
│    - userId + isRead (pour recherche rapide des notifications non lues)                                │
│    - createdAt (pour tri chronologique)                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
         │                    │
         │                    │
         │ 1:N                │ 1:N
         │ (belongsTo)        │ (belongsTo)
         │ relatedUserId      │ relatedSurveyId
         │                    │
         │                    │
         │                    │
    ┌────┴────────────────────┴────┐
    │                              │
    │                              │
┌───▼───────────────────────────────▼───────────────────────────────────────────────────────────────────────┐
│                                          TABLE: users              TABLE: surveys                          │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘


╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                    LÉGENDE DES RELATIONS                                                    ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                               ║
║  1:1  →  Relation One-to-One        (Un à un)                                                              ║
║  1:N  →  Relation One-to-Many        (Un à plusieurs)                                                         ║
║  N:1  →  Relation Many-to-One        (Plusieurs à un)                                                         ║
║  N:M  →  Relation Many-to-Many       (Plusieurs à plusieurs)                                                 ║
║                                                                                                               ║
║  PK   →  Primary Key (Clé primaire)                                                                          ║
║  FK   →  Foreign Key (Clé étrangère)                                                                         ║
║                                                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │  RELATIONS DÉTAILLÉES :                                                                              │  ║
║  │                                                                                                       │  ║
║  │  1. users ↔ teams (N:1)              │  Un utilisateur appartient à une équipe (ou aucune)          │  ║
║  │     FK: users.teamId → teams.id      │  Cardinalité: 0..1 (nullable)                                 │  ║
║  │                                                                                                       │  ║
║  │  2. teams ↔ users (1:1)              │  Une équipe a un superviseur (ou aucun)                      │  ║
║  │     FK: teams.supervisorId → users.id│  Cardinalité: 0..1 (nullable)                                 │  ║
║  │                                                                                                       │  ║
║  │  3. surveys ↔ users (N:1)           │  Un sondage est créé par un utilisateur                      │  ║
║  │     FK: surveys.createdById → users.id│  Cardinalité: 1 (NOT NULL)                                      │  ║
║  │                                                                                                       │  ║
║  │  4. surveys ↔ users (N:M)            │  Un sondage peut être assigné à plusieurs utilisateurs       │  ║
║  │     Table de liaison: survey_assignees│  Plusieurs utilisateurs peuvent être assignés à plusieurs    │  ║
║  │     FK: survey_assignees.surveyId    │  sondages                                                      │  ║
║  │     FK: survey_assignees.userId      │  Cardinalité: 0..N (plusieurs)                                  │  ║
║  │                                                                                                       │  ║
║  │  5. responses ↔ surveys (N:1)       │  Une réponse appartient à un sondage                          │  ║
║  │     FK: responses.surveyId → surveys.id│  Cardinalité: 1 (NOT NULL)                                    │  ║
║  │                                                                                                       │  ║
║  │  6. responses ↔ users (N:1)         │  Une réponse est soumise par un utilisateur (ou anonyme)     │  ║
║  │     FK: responses.respondentId → users.id│  Cardinalité: 0..1 (nullable - peut être anonyme)         │  ║
║  │                                                                                                       │  ║
║  │  7. notifications ↔ users (N:1)     │  Une notification est destinée à un utilisateur               │  ║
║  │     FK: notifications.userId → users.id│  Cardinalité: 1 (NOT NULL)                                    │  ║
║  │                                                                                                       │  ║
║  │  8. notifications ↔ users (N:1)     │  Une notification peut référencer un utilisateur (acteur)      │  ║
║  │     FK: notifications.relatedUserId → users.id│  Cardinalité: 0..1 (nullable)                       │  ║
║  │                                                                                                       │  ║
║  │  9. notifications ↔ surveys (N:1)  │  Une notification peut référencer un sondage                  │  ║
║  │     FK: notifications.relatedSurveyId → surveys.id│  Cardinalité: 0..1 (nullable)                  │  ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

#### **Résumé Visuel Simplifié des Relations :**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           VUE D'ENSEMBLE DES RELATIONS                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│  👥 users (Table centrale)                                                                    │
│     │                                                                                          │
│     ├───► teams (N:1)                    │  Un utilisateur peut appartenir à une équipe      │
│     │     users.teamId → teams.id        │  (ou aucune si teamId = NULL)                      │
│     │                                                                                          │
│     ├───► teams (1:1)                    │  Un utilisateur peut être superviseur d'une     │
│     │     teams.supervisorId → users.id   │  équipe (rôle supervisor)                         │
│     │                                                                                          │
│     ├───► surveys (1:N)                  │  Un utilisateur peut créer plusieurs sondages    │
│     │     surveys.createdById → users.id  │  (rôle admin ou supervisor)                       │
│     │                                                                                          │
│     ├───► surveys (N:M via survey_assignees)│  Un utilisateur peut être assigné à plusieurs │
│     │     survey_assignees.userId         │  sondages (via table de liaison)                  │
│     │                                                                                          │
│     ├───► responses (1:N)                 │  Un utilisateur peut soumettre plusieurs         │
│     │     responses.respondentId → users.id│  réponses (rôle field_agent ou anonyme)         │
│     │                                                                                          │
│     ├───► notifications (1:N)              │  Un utilisateur peut recevoir plusieurs           │
│     │     notifications.userId → users.id │  notifications                                    │
│     │                                                                                          │
│     └───► notifications.relatedUserId     │  Un utilisateur peut être référencé dans         │
│           (1:N)                           │  des notifications (acteur de l'action)           │
│                                                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│  📋 surveys                                                                                   │
│     │                                                                                          │
│     ├───► users (N:1)                    │  Un sondage est créé par un utilisateur          │
│     │     surveys.createdById → users.id  │  (obligatoire)                                    │
│     │                                                                                          │
│     ├───► users (N:M via survey_assignees)│  Un sondage peut être assigné à plusieurs       │
│     │     survey_assignees.surveyId      │  utilisateurs (via table de liaison)            │
│     │                                                                                          │
│     ├───► responses (1:N)                │  Un sondage peut avoir plusieurs réponses          │
│     │     responses.surveyId → surveys.id │  (obligatoire)                                    │
│     │                                                                                          │
│     └───► notifications (1:N)            │  Un sondage peut être référencé dans plusieurs    │
│           notifications.relatedSurveyId    │  notifications                                     │
│                                                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│  📝 responses                                                                                 │
│     │                                                                                          │
│     ├───► surveys (N:1)                   │  Une réponse appartient à un sondage              │
│     │     responses.surveyId → surveys.id │  (obligatoire)                                    │
│     │                                                                                          │
│     └───► users (N:1)                     │  Une réponse peut être soumise par un            │
│           responses.respondentId → users.id│  utilisateur (nullable = peut être anonyme)    │
│                                                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│  🔔 notifications                                                                             │
│     │                                                                                          │
│     ├───► users (N:1)                    │  Une notification est destinée à un utilisateur │
│     │     notifications.userId → users.id │  (obligatoire)                                    │
│     │                                                                                          │
│     ├───► users (N:1)                    │  Une notification peut référencer l'utilisateur│
│     │     notifications.relatedUserId      │  qui a déclenché l'action (nullable)             │
│     │                                                                                          │
│     └───► surveys (N:1)                   │  Une notification peut référencer un sondage   │
│           notifications.relatedSurveyId    │  (nullable)                                       │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### **Tableau Récapitulatif des Relations :**

| Table Source | Relation | Table Cible | Type | Clé Étrangère | Cardinalité | Description |
|--------------|----------|-------------|------|---------------|-------------|-------------|
| **users** | → | **teams** | N:1 | `users.teamId` | 0..1 | Un utilisateur appartient à une équipe (ou aucune) |
| **teams** | → | **users** | 1:1 | `teams.supervisorId` | 0..1 | Une équipe a un superviseur (ou aucun) |
| **surveys** | → | **users** | N:1 | `surveys.createdById` | 1 | Un sondage est créé par un utilisateur (obligatoire) |
| **surveys** ↔ **users** | N:M | **survey_assignees** | N:M | `survey_assignees.surveyId`<br>`survey_assignees.userId` | 0..N | Un sondage peut être assigné à plusieurs utilisateurs |
| **responses** | → | **surveys** | N:1 | `responses.surveyId` | 1 | Une réponse appartient à un sondage (obligatoire) |
| **responses** | → | **users** | N:1 | `responses.respondentId` | 0..1 | Une réponse est soumise par un utilisateur (peut être anonyme) |
| **notifications** | → | **users** | N:1 | `notifications.userId` | 1 | Une notification est destinée à un utilisateur (obligatoire) |
| **notifications** | → | **users** | N:1 | `notifications.relatedUserId` | 0..1 | Une notification peut référencer l'utilisateur acteur (nullable) |
| **notifications** | → | **surveys** | N:1 | `notifications.relatedSurveyId` | 0..1 | Une notification peut référencer un sondage (nullable) |

#### **Détail des Relations :**

##### **1. User ↔ Team (Many-to-One)**
```javascript
// server/models/index.js - Ligne 8-9
User.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Team.hasMany(User, { foreignKey: 'teamId', as: 'members' });
```
- **Relation :** Un utilisateur appartient à une équipe (ou aucune)
- **Clé étrangère :** `users.teamId` → `teams.id`
- **Utilisation :** Les agents de terrain sont regroupés en équipes

##### **2. Team ↔ User (Supervisor) (One-to-One)**
```javascript
// server/models/index.js - Ligne 10
Team.belongsTo(User, { foreignKey: 'supervisorId', as: 'supervisor' });
```
- **Relation :** Une équipe a un superviseur
- **Clé étrangère :** `teams.supervisorId` → `users.id`
- **Utilisation :** Chaque équipe est dirigée par un superviseur

##### **3. Survey ↔ User (CreatedBy) (Many-to-One)**
```javascript
// server/models/index.js - Ligne 13-14
Survey.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Survey, { foreignKey: 'createdById', as: 'createdSurveys' });
```
- **Relation :** Un sondage est créé par un utilisateur
- **Clé étrangère :** `surveys.createdById` → `users.id`
- **Utilisation :** Traçabilité de qui a créé chaque sondage

##### **4. Survey ↔ User (AssignedTo) (Many-to-Many)**
```javascript
// server/models/index.js - Ligne 17-28
Survey.belongsToMany(User, {
  through: SurveyAssignee,
  foreignKey: 'surveyId',
  otherKey: 'userId',
  as: 'assignedTo'
});
User.belongsToMany(Survey, {
  through: SurveyAssignee,
  foreignKey: 'userId',
  otherKey: 'surveyId',
  as: 'assignedSurveys'
});
```
- **Relation :** Un sondage peut être assigné à plusieurs utilisateurs
- **Table de liaison :** `survey_assignees`
- **Utilisation :** Un superviseur peut assigner un sondage à plusieurs agents

##### **5. Response ↔ Survey (Many-to-One)**
```javascript
// server/models/index.js - Ligne 31-32
Response.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });
Survey.hasMany(Response, { foreignKey: 'surveyId', as: 'responses' });
```
- **Relation :** Une réponse appartient à un sondage
- **Clé étrangère :** `responses.surveyId` → `surveys.id`
- **Utilisation :** Toutes les réponses sont liées à leur sondage

##### **6. Response ↔ User (Respondent) (Many-to-One)**
```javascript
// server/models/index.js - Ligne 35-36
Response.belongsTo(User, { foreignKey: 'respondentId', as: 'respondent' });
User.hasMany(Response, { foreignKey: 'respondentId', as: 'responses' });
```
- **Relation :** Une réponse est soumise par un utilisateur (ou anonyme)
- **Clé étrangère :** `responses.respondentId` → `users.id` (nullable)
- **Utilisation :** Traçabilité des réponses (peut être anonyme)

##### **7. Notification ↔ User (Many-to-One)**
```javascript
// server/models/index.js - Ligne 39-40
Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
```
- **Relation :** Une notification est destinée à un utilisateur
- **Clé étrangère :** `notifications.userId` → `users.id`
- **Utilisation :** Notifications personnalisées par utilisateur

### 5.5 Types de Données Spéciaux

#### **JSONB (JavaScript Object Notation Binary)**
```javascript
// server/models/Survey.js
questions: {
  type: DataTypes.JSONB,
  allowNull: false,
  defaultValue: []
}
```
- **Utilisation :** Stocke les questions du sondage (structure flexible)
- **Avantage :** Peut être indexé et recherché
- **Exemple :**
```json
[
  {
    "id": "q1",
    "type": "text",
    "label": "Quel est votre nom ?",
    "required": true
  },
  {
    "id": "q2",
    "type": "multiple_choice",
    "label": "Choisissez une option",
    "options": ["Option 1", "Option 2"]
  }
]
```

#### **GEOMETRY (PostGIS)**
```javascript
// server/models/Response.js
location: {
  type: DataTypes.GEOMETRY('POINT'),
  allowNull: true
}
```
- **Utilisation :** Stocke les coordonnées GPS des réponses
- **Format :** POINT(longitude, latitude)
- **Exemple :** `POINT(-1.5536 47.2184)` (Nantes, France)

#### **ENUM (Types Énumérés)**
```javascript
// server/models/User.js
role: {
  type: DataTypes.ENUM('admin', 'supervisor', 'field_agent'),
  defaultValue: 'field_agent'
}
```
- **Utilisation :** Limite les valeurs possibles
- **Avantage :** Validation au niveau de la base de données

### 5.6 Indexation et Performance

#### **Indexes Créés :**

```javascript
// server/models/Response.js - Ligne 106-117
indexes: [
  { fields: ['surveyId'] },      // Recherche rapide par sondage
  { fields: ['respondentId'] },   // Recherche rapide par utilisateur
  { fields: ['location'], using: 'GIST' } // Index spatial pour PostGIS
]
```

**Avantages :**
- Recherche rapide des réponses d'un sondage
- Recherche rapide des réponses d'un utilisateur
- Recherche géographique optimisée (rayon, proximité)

---

## 6. Résumé pour la Soutenance

### Points Clés à Retenir :

1. **Architecture :**
   - Frontend : React + TypeScript (interface utilisateur)
   - Backend : Node.js + Express (API REST)
   - Base de données : PostgreSQL + PostGIS (données géographiques)

2. **Sécurité :**
   - Mots de passe hashés avec bcrypt
   - Authentification JWT
   - Middleware de protection des routes

3. **Structure MVC :**
   - Models : Définition des données (Sequelize)
   - Routes : Gestion des requêtes HTTP (Express)
   - Pages/Components : Interface utilisateur (React)

4. **Base de Données :**
   - Relations garanties (clés étrangères)
   - Support géographique (PostGIS)
   - Types avancés (JSONB, UUID, ENUM)

5. **Communication :**
   - REST API (HTTP)
   - JSON pour l'échange de données
   - Axios pour les requêtes frontend

---

## 7. Questions Fréquentes pour la Soutenance

### Q1 : Pourquoi avoir choisi React au lieu de Vue ou Angular ?
**R :** React offre une grande flexibilité, une communauté active, et TypeScript s'intègre parfaitement. L'écosystème est riche (React Router, Zustand, etc.).

### Q2 : Pourquoi Node.js au lieu de PHP ou Python ?
**R :** Node.js permet d'utiliser JavaScript côté serveur, ce qui simplifie le développement (même langage frontend/backend). Express.js est léger et performant.

### Q3 : Pourquoi PostgreSQL au lieu de MySQL ?
**R :** PostgreSQL offre de meilleures performances, supporte JSONB nativement, et PostGIS est plus puissant que les solutions MySQL pour les données géographiques.

### Q4 : Comment fonctionne l'authentification ?
**R :** L'utilisateur se connecte avec email/password. Le serveur vérifie les identifiants, génère un token JWT, et le frontend l'envoie dans chaque requête suivante.

### Q5 : Comment sont stockées les questions des sondages ?
**R :** Les questions sont stockées en JSONB dans PostgreSQL. Cela permet une structure flexible (différents types de questions) tout en gardant la possibilité de recherche et indexation.

### Q6 : Comment fonctionne la géolocalisation ?
**R :** PostGIS stocke les coordonnées GPS (POINT) dans la table `responses`. Cela permet de calculer des distances, trouver des points dans un rayon, et afficher sur une carte.

---

## Conclusion

Ce document explique la structure technique complète de G-Survey. Le projet utilise une architecture moderne et sécurisée, avec une séparation claire entre le frontend (React) et le backend (Node.js), communiquant via une API REST, et stockant les données dans PostgreSQL avec PostGIS pour les fonctionnalités géographiques.

**Bonne chance pour votre soutenance ! 🚀**

