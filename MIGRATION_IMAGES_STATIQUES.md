# Migration des Images Statiques vers public/images

## 📋 Objectif

Migrer toutes les images statiques de `/uploads/img/` vers `/public/images/` pour qu'elles soient servies directement par Vercel (hébergement frontend).

## ✅ Modifications effectuées

### 1. Code mis à jour
- ✅ Tous les chemins `/uploads/img/...` ont été remplacés par `/images/...` dans :
  - `src/pages/Landing.tsx`
  - `src/pages/auth/Login.tsx`
  - `src/pages/auth/Register.tsx`
  - `src/pages/auth/ForgotPassword.tsx`
  - `src/pages/auth/ResetPassword.tsx`

### 2. Infrastructure Cloudinary
- ✅ Ajout de `cloudinary` dans `package.json`
- ✅ Service Cloudinary créé : `server/services/cloudinary.js`
- ✅ Routes upload modifiées : `server/routes/uploads.js` (utilise Cloudinary au lieu du stockage local)
- ✅ Service frontend mis à jour : `src/services/uploadService.ts`

### 3. Dossier public/images créé
- ✅ Dossier `public/images/` créé avec un README

## 🔄 Actions à faire MANUELLEMENT

### Étape 1 : Copier les images

Copiez tous les fichiers de `uploads/img/` vers `public/images/` :

```bash
# Depuis la racine du projet
cp -r uploads/img/* public/images/
```

**Ou sur Windows PowerShell :**
```powershell
Copy-Item -Path "uploads\img\*" -Destination "public\images\" -Recurse
```

### Étape 2 : Vérifier les images nécessaires

Assurez-vous que ces fichiers existent dans `public/images/` :

- ✅ `logolight.png` - Logo de l'application
- ✅ `background.png` - Image de fond pour les pages d'authentification
- ✅ `gsurvey.png` - Image principale de la landing page
- ✅ `agent.jpg` - Image pour la section "Agents"
- ✅ `geoloc.png` - Image pour la section "Géolocalisation"
- ✅ `geodata.png` - Image pour la section "Analytics"
- ✅ `environnement.png` - Logo témoignage Gardien Vert
- ✅ `bank.png` - Logo témoignage Capitalis Finance
- ✅ `ong.png` - Logo témoignage Yêléma-Bénin

### Étape 3 : Configuration Cloudinary

Dans votre fichier `.env` (backend), ajoutez :

```env
# Cloudinary (stockage externalisé)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

**Pour obtenir ces clés :**
1. Créez un compte sur [Cloudinary](https://cloudinary.com/)
2. Allez dans le Dashboard
3. Copiez les valeurs de :
   - Cloud Name
   - API Key
   - API Secret

### Étape 4 : Sur Render (backend)

Ajoutez les variables d'environnement Cloudinary dans votre service Render.

## 📦 Différence entre images statiques et uploads utilisateurs

### Images statiques (public/images/)
- ✅ Servies directement par Vercel
- ✅ Accessibles via `/images/nom-fichier.png`
- ✅ Pas besoin de backend
- ✅ Fast et gratuit

### Fichiers uploadés par utilisateurs (Cloudinary)
- ✅ Stockés sur Cloudinary
- ✅ Upload via `/api/uploads/files`
- ✅ URLs retournées : `https://res.cloudinary.com/.../...`
- ✅ Suppression via `/api/uploads/file/:publicId`

## 🚀 Déploiement

### Vercel (Frontend)
Les images dans `public/images/` seront automatiquement servies par Vercel.

### Render (Backend)
Les uploads utilisateurs utiliseront Cloudinary automatiquement une fois les variables d'environnement configurées.

## ⚠️ Important

- **N'ajoutez PAS** `uploads/` dans Git (il est dans `.gitignore`)
- **Ajoutez** `public/images/` dans Git (les images statiques doivent être versionnées)
- Les fichiers uploadés par les utilisateurs iront sur Cloudinary, pas sur le serveur

---

**Date de migration** : 3 novembre 2025  
**Statut** : ✅ Code prêt, migration des fichiers manuelle requise

