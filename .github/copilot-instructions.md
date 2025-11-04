# G-Survey - Instructions pour les Agents AI

## Architecture Générale
G-Survey est une plateforme de sondages avancée avec une architecture client-serveur :

### Frontend (React/TypeScript/Vite)
- `src/components/` : Composants réutilisables
- `src/pages/` : Pages principales de l'application
- `src/services/` : Services API et logique métier
- `src/store/` : État global (Zustand)
- `src/layouts/` : Mises en page partagées

### Backend (Node.js/Express)
- `server/routes/` : Points d'entrée API REST
- `server/models/` : Modèles Sequelize
- `server/middleware/` : Middleware d'authentification et gestion d'erreurs
- `server/services/` : Services métier et intégrations externes

## Patterns et Conventions Importantes

### 1. Structure des Routes
```typescript
// Format typique dans src/pages/
<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

### 2. Gestion d'État
- Utilisation de Zustand pour l'état global
- État local React pour les composants isolés
- Exemple dans `src/store/authStore.ts`

### 3. Authentification
- JWT stocké dans localStorage
- Middleware auth.js pour la protection des routes API
- Composant ProtectedRoute pour les routes frontend protégées

## Workflows Développeur

### Installation Locale
```bash
npm install
npm run dev # Frontend (port 5173)
npm run server # Backend (port 5000)
```

### Base de Données
- PostgreSQL avec PostGIS requis
- Migrations dans `server/migrations/`
- Schéma principal dans `server/migrations/init-database.sql`

### Déploiement
- Frontend : Vercel (voir DEPLOIEMENT_VERCEL_RENDER.md)
- Backend : Render (voir DEPLOIEMENT_VERCEL_RENDER.md)
- Base de données : Supabase recommandée

## Points d'Intégration Clés

### 1. Services Externes
- Cloudinary pour le stockage d'images
- SMTP pour les emails
- PostGIS pour les fonctionnalités géospatiales

### 2. APIs Critiques
- `/api/auth` : Authentification et gestion des utilisateurs
- `/api/surveys` : CRUD des sondages
- `/api/responses` : Réponses aux sondages
- `/api/analytics` : Analyses et métriques

## Conventions de Code

### TypeScript
- Types stricts requis
- Interfaces préférées aux types
- Génériques pour les composants réutilisables

### État et Effets
- useEffect pour les effets de bord
- useMemo/useCallback pour l'optimisation
- Custom hooks dans `src/hooks/`

### Tests
- Jest pour les tests unitaires
- Cypress pour les tests E2E (à implémenter)