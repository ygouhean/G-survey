# 🔧 Guide de Dépannage G-Survey

Solutions aux problèmes courants rencontrés lors de l'installation et l'utilisation.

---

## 🚨 Problèmes d'Installation

### ❌ Erreur : "npm install" échoue

**Symptômes :**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions :**
```bash
# Option 1 : Force l'installation
npm install --legacy-peer-deps

# Option 2 : Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Option 3 : Utiliser une version spécifique de Node
nvm install 18
nvm use 18
npm install
```

---

### ❌ Erreur : MongoDB ne démarre pas

**Symptômes :**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions :**

#### Sur Linux :
```bash
# Vérifier le statut
sudo systemctl status mongod

# Démarrer MongoDB
sudo systemctl start mongod

# Activer au démarrage
sudo systemctl enable mongod

# Voir les logs
sudo journalctl -u mongod -f
```

#### Sur Mac :
```bash
# Avec Homebrew
brew services start mongodb-community

# Vérifier
brew services list
```

#### Sur Windows :
```powershell
# Démarrer le service
net start MongoDB

# Ou via Services Manager
services.msc > MongoDB > Start
```

#### Avec Docker (Recommandé) :
```bash
# Démarrer MongoDB
docker run -d -p 27017:27017 --name g-survey-mongodb mongo:latest

# Vérifier
docker ps

# Voir les logs
docker logs g-survey-mongodb

# Arrêter
docker stop g-survey-mongodb

# Redémarrer
docker start g-survey-mongodb
```

---

### ❌ Erreur : Port déjà utilisé

**Symptômes :**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions :**

#### Option 1 : Tuer le processus
```bash
# Linux/Mac - Trouver le processus
lsof -i :5000

# Tuer le processus (remplacer PID)
kill -9 PID

# Windows
netstat -ano | findstr :5000
taskkill /PID PID /F
```

#### Option 2 : Changer le port
```bash
# Modifier .env
PORT=5001

# Redémarrer
npm run dev
```

---

## 🔐 Problèmes d'Authentification

### ❌ Login échoue avec "Token invalide"

**Causes possibles :**
- JWT_SECRET différent entre redémarrages
- Token expiré
- Problème de synchronisation horloge

**Solutions :**
```bash
# 1. Vérifier .env
cat .env | grep JWT_SECRET

# 2. Nettoyer le localStorage
# Dans la console navigateur :
localStorage.clear()

# 3. Regénérer un secret fort
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copier dans .env > JWT_SECRET

# 4. Redémarrer le serveur
npm run dev
```

---

### ❌ Mot de passe admin ne fonctionne pas

**Solutions :**
```bash
# 1. Vérifier les identifiants dans .env
cat .env | grep ADMIN

# 2. Réinitialiser la base de données
./scripts/reset-db.sh

# 3. Redémarrer le serveur (admin sera recréé)
npm run dev

# 4. Login avec :
# Email: admin@gsurvey.com
# Password: Admin@123
```

---

### ❌ "403 Forbidden" sur certaines routes

**Cause :** Permissions insuffisantes pour le rôle

**Solution :**
- Vérifiez le rôle de l'utilisateur connecté
- Certaines routes sont réservées aux admins
- Utilisez un compte admin pour accéder

---

## 📊 Problèmes de Données

### ❌ Sondages n'apparaissent pas

**Diagnostics :**
```bash
# Vérifier MongoDB
mongosh gsurvey --eval "db.surveys.find().pretty()"

# Vérifier les logs serveur
# Chercher des erreurs dans le terminal
```

**Solutions :**
1. Vérifier que l'utilisateur a les permissions
2. Vérifier le statut du sondage (draft/active)
3. Vérifier les assignations
4. Créer un nouveau sondage de test

---

### ❌ Réponses ne se sauvegardent pas

**Vérifications :**
```javascript
// Dans la console navigateur
// Vérifier les erreurs réseau
// Onglet Network > Filter: XHR
```

**Solutions :**
1. Vérifier que le sondage est "active"
2. Vérifier la connexion au serveur
3. Vérifier les champs obligatoires
4. Regarder la console pour les erreurs

---

### ❌ Base de données corrompue

**Solution radicale :**
```bash
# ATTENTION : Supprime TOUTES les données !

# Arrêter le serveur
Ctrl+C

# Supprimer la base
mongosh gsurvey --eval "db.dropDatabase()"

# Ou avec le script
./scripts/reset-db.sh

# Redémarrer
npm run dev
```

---

## 🗺️ Problèmes de Carte

### ❌ Carte ne s'affiche pas

**Symptômes :**
- Zone grise au lieu de la carte
- Console : "Leaflet is not defined"

**Solutions :**
```bash
# 1. Vérifier les imports CSS dans index.html
cat index.html | grep leaflet

# 2. Réinstaller leaflet
npm install leaflet react-leaflet --save

# 3. Nettoyer le cache
rm -rf node_modules/.vite
npm run dev

# 4. Vérifier la connexion internet (tiles OpenStreetMap)
```

---

### ❌ Marqueurs ne s'affichent pas

**Solutions :**
1. Vérifier que les réponses ont des coordonnées
2. Console : Chercher erreurs Leaflet
3. Vérifier format : `[longitude, latitude]`
4. Tester avec des données de demo :
```javascript
// Console navigateur
{
  coordinates: [2.3522, 48.8566] // Paris
}
```

---

### ❌ Géolocalisation ne fonctionne pas

**Causes :**
- HTTPS requis (sauf localhost)
- Permission refusée par l'utilisateur
- Navigateur ne supporte pas

**Solutions :**
1. Utiliser HTTPS en production
2. Autoriser la géolocalisation dans le navigateur
3. Vérifier console pour erreurs
4. Utiliser Chrome/Firefox récent

---

## 📈 Problèmes d'Analytics

### ❌ Graphiques ne s'affichent pas

**Solutions :**
```bash
# Vérifier Chart.js
npm list chart.js

# Réinstaller
npm install chart.js react-chartjs-2 --save

# Nettoyer cache
rm -rf node_modules/.vite
npm run dev
```

---

### ❌ Calculs NPS incorrects

**Vérification du calcul :**
```
NPS = (% Promoteurs - % Détracteurs)

Promoteurs : scores 9-10
Passifs : scores 7-8
Détracteurs : scores 0-6

Exemple :
10 réponses : 4x(10), 3x(7), 3x(5)
Promoteurs : 4/10 = 40%
Détracteurs : 3/10 = 30%
NPS = 40 - 30 = 10
```

**Si toujours incorrect :**
1. Vérifier le code dans `server/routes/analytics.js`
2. Vérifier les données en base
3. Tester avec des réponses de test

---

## 📤 Problèmes d'Export

### ❌ Export Excel ne télécharge pas

**Solutions :**
```bash
# Vérifier XLSX
npm list xlsx

# Réinstaller
npm install xlsx --save

# Vérifier Content-Type dans la réponse
# Network tab > Export request > Response Headers
```

---

### ❌ Fichier CSV mal encodé (accents)

**Solution :**
Le fichier utilise UTF-8 avec BOM. Si Excel affiche mal :

1. **Ouvrir avec Excel :**
   - Fichier > Importer > Fichier CSV
   - Sélectionner "UTF-8"
   
2. **Ou utiliser LibreOffice :**
   - S'ouvre directement bien

---

## 🎨 Problèmes d'Interface

### ❌ Styles Tailwind ne s'appliquent pas

**Solutions :**
```bash
# 1. Vérifier tailwind.config.js
cat tailwind.config.js

# 2. Vérifier postcss.config.js
cat postcss.config.js

# 3. Nettoyer et rebuild
rm -rf node_modules/.vite
npm run dev

# 4. Vérifier import dans src/index.css
head -3 src/index.css
```

---

### ❌ Dark mode ne fonctionne pas

**Solution :**
```javascript
// Console navigateur
document.documentElement.classList.toggle('dark')

// Vérifier stockage
localStorage.getItem('theme')

// Forcer dark mode
document.documentElement.classList.add('dark')
```

---

### ❌ Composants ne s'affichent pas (écran blanc)

**Diagnostic :**
1. Ouvrir console navigateur (F12)
2. Chercher erreurs JavaScript
3. Vérifier Network pour erreurs 404

**Solutions courantes :**
```bash
# Erreur d'import
# Vérifier les chemins dans les imports

# Module manquant
npm install

# Erreur TypeScript
npm run build
# Corriger les erreurs affichées
```

---

## 🔧 Problèmes de Performance

### ❌ Application lente

**Optimisations :**
```bash
# 1. Vérifier mode production
NODE_ENV=production npm run build
npm run preview

# 2. Vérifier taille du bundle
npm run build
# Regarder dist/assets/*.js

# 3. Optimiser images
# Utiliser WebP, compresser

# 4. Activer lazy loading
# Déjà fait pour les routes
```

---

### ❌ MongoDB lent

**Optimisations :**
```javascript
// Créer des index
mongosh gsurvey
db.responses.createIndex({ survey: 1 })
db.responses.createIndex({ location: "2dsphere" })
db.surveys.createIndex({ status: 1 })
```

---

## 🌐 Problèmes de Déploiement

### ❌ Variables d'environnement non chargées

**Solution :**
```bash
# Vérifier .env existe
ls -la .env

# Vérifier contenu
cat .env

# Recharger
source .env  # Linux/Mac
# ou redémarrer le serveur
```

---

### ❌ CORS errors en production

**Solution dans server/index.js :**
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://votre-domaine.com'  // Ajouter votre domaine
  ],
  credentials: true
}));
```

---

## 🆘 En Cas de Problème Persistant

### Réinitialisation Complète

```bash
# 1. Sauvegarder les données importantes
# Exporter les sondages depuis l'interface

# 2. Nettoyer complètement
rm -rf node_modules
rm package-lock.json
rm -rf node_modules/.vite

# 3. Réinitialiser la base
./scripts/reset-db.sh

# 4. Réinstaller
npm install

# 5. Reconfigurer .env
cp .env.example .env
# Éditer .env avec vos valeurs

# 6. Redémarrer
npm run dev
```

---

## 📞 Obtenir de l'Aide

### Informations à fournir

Quand vous demandez de l'aide, incluez :

1. **Erreur exacte :**
   ```
   Copier/coller le message d'erreur complet
   ```

2. **Environnement :**
   ```bash
   node --version
   npm --version
   OS: [Windows/Mac/Linux]
   ```

3. **Étapes pour reproduire :**
   - Ce que vous avez fait
   - Ce qui devrait se passer
   - Ce qui se passe réellement

4. **Logs :**
   - Console navigateur (F12)
   - Terminal serveur
   - Logs MongoDB

### Ressources

- 📖 Documentation : README.md
- 🐛 Issues GitHub
- 💬 Stack Overflow
- 📧 Contact mainteneur

---

## 🎯 Checklist de Debug

Avant de demander de l'aide, vérifiez :

- [ ] Dernière version du code (`git pull`)
- [ ] Dépendances à jour (`npm install`)
- [ ] MongoDB running
- [ ] .env configuré
- [ ] Console sans erreur
- [ ] Cache navigateur vidé (Ctrl+Shift+R)
- [ ] Essayé sur navigateur différent
- [ ] Logs consultés

---

**Dernière mise à jour :** 2024-01-15

**Besoin d'aide ?** Créez une issue sur GitHub avec les détails du problème.