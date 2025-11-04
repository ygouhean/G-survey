# Déploiement G-Survey sur Vercel (Frontend) et Render (Backend)

Ce guide explique comment déployer le frontend (React/Vite) sur Vercel, et l'API Node/Express sur Render, avec base PostgreSQL (idéalement Supabase) et stockage Cloudinary.

---

## 1) Pré-requis
- Dépôt GitHub: `ygouhean/G-survey`
- Cloudinary configuré (Cloud Name, API Key, API Secret)
- Base PostgreSQL accessible publiquement (recommandé: Supabase avec PostGIS activé)
- SMTP opérationnel (envoi emails)

---

## 2) Frontend sur Vercel

1. Aller sur Vercel → New Project → Importer `ygouhean/G-survey`.
2. Framework preset: Vite
3. Build & Output:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Variables d’environnement (Vercel → Project Settings → Environment Variables):
   - `VITE_API_URL` = URL publique de votre API Render (ex: `https://g-survey-api.onrender.com`)
5. Lancer le déploiement.

Notes:
- Les images statiques sont servies depuis `public/images`. Aucune config supplémentaire.
- Le frontend consomme l’API via `VITE_API_URL`.

---

## 3) Backend sur Render

1. Render → New → Web Service → Connecter `ygouhean/G-survey`.
2. Root Directory: racine du repo
3. Runtime: Node
4. Build Command: `npm install`
5. Start Command: `node server/index.js`
6. (Optionnel) Health Check path: `/api/health`
7. Variables d’environnement (Render → Environment → Add):

### Variables obligatoires
- `NODE_ENV` = `production`
- `PORT` = `5000` (Render l’injecte automatiquement, mais le code écoute `process.env.PORT`)
- `CLIENT_URL` = URL Vercel (ex: `https://g-survey.vercel.app`)
- `JWT_SECRET` = chaîne robuste

### PostgreSQL (ex: Supabase)
- `POSTGRES_HOST` = (ex: `aws-...supabase.co`)
- `POSTGRES_PORT` = `5432`
- `POSTGRES_DB` = `gsurvey` (ou votre nom de base)
- `POSTGRES_USER` = `postgres` (ou utilisateur dédié)
- `POSTGRES_PASSWORD` = (mot de passe)

### Cloudinary
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### SMTP
- `SMTP_HOST` (ex: `smtp.gmail.com`)
- `SMTP_PORT` (ex: `465` ou `587`)
- `SMTP_SECURE` (`true` si 465, sinon `false`)
- `SMTP_USER`
- `SMTP_PASS`

### Divers
- `ADMIN_EMAIL` (ex: `admin@gsurvey.com`)
- `ADMIN_PASSWORD` (ex: `Admin@123` – modifiez en prod)

8. Créer le service → Render déploie et fournit l’URL (ex: `https://g-survey-api.onrender.com`).

---

## 4) Base de données (recommandé: Supabase + PostGIS)

### Configuration Supabase

1. **Créer un projet Supabase** :
   - Allez sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet
   - Notez le mot de passe de la base de données (vous ne pourrez plus le voir après)

2. **Récupérer les informations de connexion** :
   - Dans Supabase : **Settings** → **Database**
   - Section **Connection string** → **URI** ou **Connection pooling**
   - Utilisez l'**URI directe** (pas le pooler) pour les variables d'environnement
   - Format : `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Extraire les variables** :
   - `POSTGRES_HOST` = `db.[PROJECT-REF].supabase.co` (ex: `db.udfhiiqnozfijhejdhuu.supabase.co`)
   - `POSTGRES_PORT` = `5432`
   - `POSTGRES_DB` = **`postgres`** (base par défaut Supabase - ⚠️ utilisez "postgres", pas "gsurvey")
   - `POSTGRES_USER` = `postgres`
   - `POSTGRES_PASSWORD` = le mot de passe que vous avez noté
   
   **Note importante** : Supabase utilise `postgres` comme nom de base par défaut. Si vous créez vos tables dans cette base, utilisez `postgres` comme valeur de `POSTGRES_DB`. Vous pouvez créer une base séparée si nécessaire, mais `postgres` fonctionne parfaitement.

4. **Activer PostGIS** :
   - Dans Supabase : **SQL Editor**
   - Exécutez : `CREATE EXTENSION IF NOT EXISTS postgis;`
   - Vérifiez : `SELECT PostGIS_version();`

5. **Important** :
   - ✅ Le code configure automatiquement SSL pour Supabase (détecte "supabase" dans le host)
   - ✅ Pas besoin de configuration SSL supplémentaire
   - ⚠️ Assurez-vous que `POSTGRES_HOST` contient bien "supabase" pour activer SSL automatiquement

---

## 5) Vérifications post-déploiement

### Backend
- Accédez à `GET https://<render-url>/api/auth/health` (si route health exposée) ou testez `/api/auth/login` via un client HTTP.
- Uploads: `POST /api/uploads/files` doit renvoyer des URLs Cloudinary (champ `url`) et `public_id`.
- Emails: testez `/api/auth/forgot-password` (vérifiez la réception email).

### Frontend
- Ouvrez l’URL Vercel.
- Vérifiez: pages Landing / Login / Register / Forgot / Reset.
- Vérifiez que les images s’affichent (sources `/images/...`).
- Connectez-vous avec l’admin par défaut (si non déjà créé en base):
  - Email: `admin@gsurvey.com`
  - Mot de passe: `Admin@123`

---

## 6) Points d’attention
- CORS: assurez-vous que l’API autorise `CLIENT_URL` (le code Express utilise `cors`; si besoin, restreignez origin).
- Cloudinary: les téléchargements utilisateurs ne passent plus par `uploads/` local, mais par Cloudinary. Les réponses renvoient des URLs absolues.
- Sécurité: changez immédiatement `ADMIN_PASSWORD` après le premier login.
- Logs Render: utiles pour diagnostiquer des variables manquantes.

---

## 7) Dépannage rapide

### Erreur de connexion PostgreSQL
- **Erreur `ENETUNREACH` ou `ECONNREFUSED`** :
  - ✅ Vérifiez que `POSTGRES_HOST` contient "supabase" (SSL activé automatiquement)
  - ✅ Vérifiez que toutes les variables `POSTGRES_*` sont correctement définies dans Render
  - ✅ Vérifiez que le mot de passe Supabase est correct (régénérer si nécessaire)
  - ✅ Vérifiez que PostGIS est activé dans Supabase
  - ✅ Vérifiez les logs Render pour voir les détails de l'erreur

- **Erreur SSL** :
  - Le code configure automatiquement SSL pour Supabase
  - Si l'erreur persiste, vérifiez que `POSTGRES_HOST` contient bien "supabase"

### Autres erreurs
- **400/401 Auth** : vérifier `JWT_SECRET`, emails/mots de passe, et la DB.
- **Uploads échouent** : vérifier `CLOUDINARY_*` et que `server/services/cloudinary.js` est bien chargé.
- **Images manquantes côté front** : vérifier que les fichiers existent dans `public/images/` et que les chemins sont `/images/...`.
- **Emails non reçus** : vérifier `SMTP_*`, port/secure, et la console Render.

---

## 8) Résumé variables

### Vercel
- `VITE_API_URL`

### Render
- `NODE_ENV`, `PORT`, `CLIENT_URL`, `JWT_SECRET`
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`

---

Bon déploiement 🚀
