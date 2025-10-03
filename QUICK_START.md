# 🚀 Guide de Démarrage Rapide - G-Survey

Ce guide vous permettra de lancer G-Survey en 5 minutes !

## 📋 Prérequis Vérification

Vérifiez que vous avez les outils nécessaires :

```bash
# Vérifier Node.js (doit être 18+)
node --version

# Vérifier npm
npm --version

# Vérifier MongoDB (optionnel si vous utilisez Docker)
mongod --version
```

## ⚡ Installation Express

### Option 1 : MongoDB Local

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer MongoDB (si pas déjà lancé)
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac

# 3. Lancer l'application
npm run dev
```

### Option 2 : MongoDB avec Docker (Recommandé)

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer MongoDB dans Docker
docker run -d -p 27017:27017 --name g-survey-mongodb mongo:latest

# 3. Lancer l'application
npm run dev
```

## 🎯 Accès à l'Application

Une fois lancée, l'application sera disponible sur :

- **Interface Web** : http://localhost:5173
- **API Backend** : http://localhost:5000

## 🔑 Première Connexion

Utilisez les identifiants administrateur par défaut :

```
Email    : admin@gsurvey.com
Password : Admin@123
```

⚠️ **Important** : Changez ce mot de passe en production !

## 📝 Créer Votre Premier Sondage (2 minutes)

1. **Connectez-vous** avec les identifiants admin
2. Cliquez sur **"📋 Sondages"** dans le menu latéral
3. Cliquez sur **"➕ Créer un Sondage"**
4. Remplissez les informations :
   - Titre : "Enquête de Satisfaction Client"
   - Description : "Évaluez votre expérience"
5. Ajoutez des questions :
   - Cliquez sur **"⭐ NPS"** pour ajouter une question NPS
   - Cliquez sur **"😊 CSAT"** pour ajouter une question de satisfaction
   - Donnez un libellé à chaque question
6. Cliquez sur **"🚀 Activer le sondage"**

Voilà ! Votre premier sondage est créé ! 🎉

## 👥 Créer des Utilisateurs

### Créer un Agent de Terrain

1. Allez dans **"👥 Utilisateurs"**
2. Cliquez sur **"➕ Nouvel Utilisateur"**
3. Remplissez :
   ```
   Prénom   : Jean
   Nom      : Dupont
   Email    : jean.dupont@example.com
   Password : Password123
   Rôle     : Agent de terrain
   ```
4. Cliquez sur **"Créer"**

### Créer un Superviseur

Même processus, mais sélectionnez **"Superviseur"** comme rôle.

## 📊 Tester les Fonctionnalités

### 1. Soumettre une Réponse

1. Ouvrez votre sondage
2. Cliquez sur **"📝 Répondre au sondage"**
3. Répondez aux questions
4. Autorisez la géolocalisation si demandé
5. Cliquez sur **"✓ Soumettre"**

### 2. Visualiser les Analytics

1. Retournez sur le sondage
2. Cliquez sur **"📊 Analytics"**
3. Explorez les graphiques :
   - Score NPS
   - Distribution CSAT
   - Recommandations automatiques

### 3. Vue Cartographique

1. Cliquez sur **"🗺️ Vue cartographique"**
2. Visualisez les réponses géolocalisées
3. Filtrez par promoteurs/passifs/détracteurs
4. Cliquez sur les marqueurs pour voir les détails

### 4. Exporter les Données

1. Ouvrez un sondage avec des réponses
2. Dans la section **"Exporter les données"**
3. Cliquez sur :
   - **"📊 Excel"** pour un fichier Excel complet
   - **"📄 CSV"** pour une analyse dans d'autres outils
   - **"💾 JSON"** pour une intégration API

## 🎨 Personnalisation

### Changer le Thème

Cliquez sur l'icône **☀️/🌙** dans le header pour basculer entre mode clair et sombre.

### Modifier votre Profil

1. Cliquez sur votre avatar en haut à droite
2. Sélectionnez **"⚙️ Paramètres"**
3. Modifiez vos informations
4. Changez votre mot de passe dans l'onglet **"🔒 Sécurité"**

## 🔧 Commandes Utiles

```bash
# Lancer uniquement le backend
npm run server

# Lancer uniquement le frontend
npm run client

# Lancer les deux en parallèle (recommandé)
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview
```

## 🐛 Dépannage

### Problème : MongoDB ne démarre pas

```bash
# Vérifier si MongoDB tourne
sudo systemctl status mongod

# Redémarrer MongoDB
sudo systemctl restart mongod

# Ou avec Docker
docker start g-survey-mongodb
```

### Problème : Port déjà utilisé

```bash
# Trouver le processus utilisant le port 5000
lsof -i :5000

# Tuer le processus (remplacer PID)
kill -9 PID
```

### Problème : Dépendances manquantes

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📚 Prochaines Étapes

Maintenant que vous avez pris en main G-Survey :

1. ✅ Explorez toutes les fonctionnalités
2. ✅ Créez des sondages complexes avec logique conditionnelle
3. ✅ Testez la synchronisation hors-ligne
4. ✅ Expérimentez avec les différents types de questions
5. ✅ Générez des rapports complets

## 🆘 Besoin d'Aide ?

- 📖 Consultez le [README.md](./README.md) pour la documentation complète
- 🐛 Signalez un bug sur GitHub Issues
- 💬 Contactez l'équipe de développement

---

Bon sondage ! 🎯