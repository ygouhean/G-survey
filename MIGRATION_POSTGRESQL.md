# Migration MongoDB vers PostgreSQL/PostGIS

Ce document décrit les changements effectués lors de la migration de MongoDB/Mongoose vers PostgreSQL/PostGIS avec Sequelize.

## Changements principaux

### 1. Dépendances
- **Supprimé**: `mongoose`
- **Ajouté**: 
  - `sequelize` - ORM pour PostgreSQL
  - `pg` - Driver PostgreSQL
  - `pg-hstore` - Support pour le type hstore de PostgreSQL

### 2. Configuration de la base de données

#### Docker Compose
- Remplacement de l'image MongoDB par `postgis/postgis:15-3.4`
- Port changé de `27017` à `5432`
- Variables d'environnement mises à jour pour PostgreSQL

#### Variables d'environnement
Nouvelles variables requises:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gsurvey
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### 3. Modèles de données

#### Changements structurels
- **IDs**: Passage de `ObjectId` (MongoDB) vers `UUID` (PostgreSQL)
- **Types de données**:
  - `Schema.Types.Mixed` → `JSONB`
  - `[String]` → `ARRAY(DataTypes.STRING)`
  - Géométries MongoDB → `GEOMETRY` PostGIS avec index GIST

#### Modèles convertis
1. **User**: 
   - `_id` → `id` (UUID)
   - `team` → `teamId` (foreign key)
   - Scopes ajoutés pour exclure/inclure le mot de passe

2. **Team**:
   - `_id` → `id` (UUID)
   - `supervisor` → `supervisorId` (foreign key)

3. **Survey**:
   - `_id` → `id` (UUID)
   - `createdBy` → `createdById` (foreign key)
   - `assignedTo` → Table de jonction `SurveyAssignee` (Many-to-Many)
   - `questions` → Tableau JSONB

4. **Response**:
   - `_id` → `id` (UUID)
   - `survey` → `surveyId` (foreign key)
   - `respondent` → `respondentId` (foreign key)
   - `location` → `GEOMETRY('POINT')` avec index GIST
   - Calcul automatique des scores via hook `beforeSave`

### 4. Requêtes et opérations

#### Changements de syntaxe
- `Model.find()` → `Model.findAll()`
- `Model.findById()` → `Model.findByPk()`
- `Model.findOne({ email })` → `Model.findOne({ where: { email } })`
- `.populate()` → `include` dans Sequelize
- `Model.create()` → `Model.create()` (syntaxe similaire)
- `Model.update()` → `Model.update()` ou `instance.update()`
- `Model.deleteOne()` → `instance.destroy()`

#### Requêtes géospatiales
- MongoDB `2dsphere` index → PostGIS `GIST` index
- Extraction des coordonnées avec `ST_X()` et `ST_Y()`
- Création de points avec `ST_SetSRID(ST_MakePoint(), 4326)`

#### Requêtes complexes
- Aggrégations MongoDB → Requêtes SQL natives avec `sequelize.query()`
- `$in` → `Op.in`
- `$gte` / `$lte` → `Op.gte` / `Op.lte`

### 5. Routes adaptées

Toutes les routes ont été mises à jour:
- `server/routes/auth.js`
- `server/routes/surveys.js`
- `server/routes/responses.js`
- `server/routes/analytics.js`
- `server/routes/exports.js`

#### Changements notables dans les routes
- Utilisation de `include` pour les jointures au lieu de `populate`
- Gestion des associations Many-to-Many via `setAssignedTo()` / `getAssignedTo()`
- Requêtes SQL natives pour les agrégations temporelles

### 6. Middleware

#### `server/middleware/auth.js`
- `User.findById()` → `User.findByPk()`
- Utilisation de `scopes` pour exclure/inclure le mot de passe
- Adaptation des vérifications d'accès aux sondages

### 7. PostGIS - Fonctionnalités géospatiales

#### Activation
L'extension PostGIS est automatiquement activée au démarrage:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

#### Utilisation
- Stockage: `GEOMETRY('POINT')` pour les coordonnées GPS
- Index: Index GIST pour les requêtes spatiales performantes
- Extraction: Utilisation de `ST_X()` et `ST_Y()` pour obtenir les coordonnées

### 8. Migration des données

**⚠️ Important**: Cette migration ne migre PAS automatiquement les données existantes.

Si vous avez des données MongoDB existantes, vous devez:
1. Exporter les données MongoDB
2. Transformer les ObjectIds en UUIDs
3. Convertir les géométries MongoDB en format PostGIS
4. Importer dans PostgreSQL

### 9. Commandes de démarrage

#### Installation sur Windows

1. **Installer PostgreSQL 15+ avec PostGIS**
   - Télécharger depuis [postgresql.org](https://www.postgresql.org/download/windows/)
   - Installer PostGIS depuis [postgis.net](https://postgis.net/windows_downloads/)

2. **Créer la base de données**
   ```sql
   -- Ouvrir pgAdmin ou psql
   CREATE DATABASE gsurvey;
   \c gsurvey
   CREATE EXTENSION postgis;
   ```

3. **Installer les dépendances**
   ```bash
   npm install
   ```

4. **Configurer .env**
   ```env
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=gsurvey
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=votre_mot_de_passe
   ```

5. **Démarrer le serveur**
   ```bash
   npm run server
   ```

La base de données sera automatiquement synchronisée en mode développement.

### 10. Points d'attention

1. **UUIDs vs ObjectIds**: Les IDs sont maintenant des UUIDs, pas des ObjectIds MongoDB
2. **Synchronisation**: `sequelize.sync()` est utilisé en développement, utilisez des migrations en production
3. **PostGIS**: L'extension est nécessaire pour les fonctionnalités géospatiales
4. **Associations**: Les associations Many-to-Many nécessitent une table de jonction explicite

### 11. Prochaines étapes recommandées

1. Créer des migrations Sequelize pour la production
2. Ajouter des tests pour les requêtes géospatiales
3. Optimiser les index selon les besoins
4. Configurer les backups PostgreSQL
5. Mettre en place un système de migration de données si nécessaire

