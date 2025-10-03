# ✅ Checklist Complète G-Survey

Document de vérification avant soutenance - À cocher au fur et à mesure des tests.

---

## 📦 Installation & Configuration

- [ ] Node.js 18+ installé
- [ ] MongoDB installé ou Docker disponible
- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env` créé et configuré
- [ ] MongoDB démarré et accessible
- [ ] Serveur backend démarre sans erreur (`npm run server`)
- [ ] Frontend démarre sans erreur (`npm run client`)
- [ ] Les deux tournent ensemble (`npm run dev`)

---

## 🔐 Module Authentification

### Login
- [ ] Page de login s'affiche correctement
- [ ] Login avec admin@gsurvey.com fonctionne
- [ ] Message d'erreur si mauvais mot de passe
- [ ] Redirection vers dashboard après login
- [ ] Token JWT stocké dans localStorage
- [ ] Déconnexion fonctionne

### Gestion des Utilisateurs
- [ ] Création d'un utilisateur (admin)
- [ ] Email unique vérifié
- [ ] Mot de passe haché en base
- [ ] Liste des utilisateurs affichée (admin)
- [ ] Filtrage par rôle fonctionne
- [ ] Modification de profil fonctionne
- [ ] Changement de mot de passe fonctionne

### Gestion des Rôles
- [ ] Admin voit tous les menus
- [ ] Superviseur ne voit pas "Utilisateurs"
- [ ] Agent terrain accès limité
- [ ] Routes protégées selon rôle
- [ ] Message d'erreur si accès non autorisé

---

## 📋 Module Création de Questionnaires

### Interface Builder
- [ ] Page de création s'affiche
- [ ] Palette des types de questions visible
- [ ] Drag & drop fonctionne
- [ ] Réorganisation des questions fonctionne
- [ ] Suppression de question fonctionne
- [ ] Duplication fonctionne

### Types de Questions
- [ ] ✅ Texte libre
- [ ] ✅ Email avec validation
- [ ] ✅ Téléphone avec validation
- [ ] ✅ NPS (0-10)
- [ ] ✅ CSAT (1-5 étoiles)
- [ ] ✅ CES (1-7)
- [ ] ✅ Choix multiple
- [ ] ✅ Cases à cocher
- [ ] ✅ Échelle
- [ ] ✅ Géolocalisation
- [ ] ✅ Mesure de superficie
- [ ] ✅ Date
- [ ] ✅ Heure

### Configuration
- [ ] Champ requis fonctionne
- [ ] Placeholder personnalisé
- [ ] Options pour choix multiple
- [ ] Validation min/max
- [ ] Logique conditionnelle (bonus)

### Paramètres du Sondage
- [ ] Titre et description requis
- [ ] Nombre cible de réponses
- [ ] Dates de début/fin
- [ ] Paramètres sauvegardés :
  - [ ] Réponses anonymes
  - [ ] Géolocalisation requise
  - [ ] Mode hors-ligne
  - [ ] Barre de progression
  - [ ] Randomisation

### Prévisualisation
- [ ] Aperçu mobile s'affiche
- [ ] Questions visibles dans l'aperçu
- [ ] Responsive correct

### Sauvegarde
- [ ] Enregistrement en brouillon
- [ ] Activation du sondage
- [ ] Redirection après création
- [ ] Sondage visible dans la liste

---

## 📊 Module Tableau de Bord

### Dashboard Global
- [ ] Statistiques affichées :
  - [ ] Total sondages
  - [ ] Total réponses
  - [ ] Réponses aujourd'hui
  - [ ] NPS moyen
- [ ] Graphique activité hebdomadaire
- [ ] Graphique statuts des sondages
- [ ] Liste sondages récents
- [ ] Actions rapides fonctionnelles

### Liste des Sondages
- [ ] Tous les sondages affichés
- [ ] Filtres par statut fonctionnent
- [ ] Barre de progression des réponses
- [ ] Actions (voir, modifier, supprimer)
- [ ] Duplication de sondage
- [ ] Suppression avec confirmation

### Vue Détaillée Sondage
- [ ] Informations générales
- [ ] Statistiques (réponses, taux)
- [ ] Liste des questions
- [ ] Actions rapides
- [ ] Changement de statut
- [ ] Exports disponibles

---

## 📈 Module Analytics

### Métriques NPS
- [ ] Score NPS calculé correctement
- [ ] Graphique circulaire affiché
- [ ] Promoteurs comptés (9-10)
- [ ] Passifs comptés (7-8)
- [ ] Détracteurs comptés (0-6)
- [ ] Pourcentages corrects
- [ ] Explication du calcul

### Métriques CSAT
- [ ] Moyenne calculée
- [ ] Distribution par étoiles
- [ ] Graphique en barres
- [ ] Total de réponses

### Métriques CES
- [ ] Score moyen sur 7
- [ ] Distribution 1-7
- [ ] Graphique affiché

### Filtres Temporels
- [ ] Filtre par jour
- [ ] Filtre par semaine
- [ ] Filtre par mois
- [ ] Filtre par année
- [ ] Données mises à jour

### Recommandations
- [ ] Alerte si NPS < 0
- [ ] Alerte si CSAT < 3
- [ ] Alerte si taux faible
- [ ] Message de succès si bon score

---

## 🗺️ Module Cartographie

### Carte de Base
- [ ] Carte OpenStreetMap affichée
- [ ] Zoom fonctionnel (molette + boutons)
- [ ] Déplacement par drag
- [ ] Responsive sur mobile

### Marqueurs
- [ ] Marqueurs affichés aux bonnes positions
- [ ] Couleurs selon NPS :
  - [ ] 🟢 Vert pour promoteurs
  - [ ] 🟡 Orange pour passifs
  - [ ] 🔴 Rouge pour détracteurs
- [ ] Clustering automatique
- [ ] Compteur dans les clusters
- [ ] Dézoom au clic sur cluster

### Popups
- [ ] Popup au clic sur marqueur
- [ ] Nom du répondant
- [ ] Scores affichés
- [ ] Date de soumission
- [ ] Formatage correct

### Filtres & Légende
- [ ] Filtre "Tous"
- [ ] Filtre "Promoteurs"
- [ ] Filtre "Passifs"
- [ ] Filtre "Détracteurs"
- [ ] Compteurs mis à jour
- [ ] Légende visible
- [ ] Statistiques en footer

### Géolocalisation
- [ ] Capture des coordonnées
- [ ] Permission demandée
- [ ] Coordonnées stockées en base
- [ ] Format [longitude, latitude]

---

## 📤 Module Exports

### Export Excel
- [ ] Téléchargement fonctionne
- [ ] Fichier .xlsx valide
- [ ] Toutes les colonnes présentes
- [ ] Données correctes
- [ ] Formatage lisible
- [ ] Nom de fichier avec timestamp

### Export CSV
- [ ] Téléchargement fonctionne
- [ ] Fichier .csv valide
- [ ] UTF-8 avec BOM
- [ ] Ouvrable dans Excel
- [ ] Délimiteur virgule
- [ ] Caractères spéciaux gérés

### Export JSON
- [ ] Téléchargement fonctionne
- [ ] JSON valide
- [ ] Structure cohérente
- [ ] Métadonnées du sondage
- [ ] Tableau de réponses
- [ ] Utilisable pour API

---

## 🎨 Interface Utilisateur

### Design Général
- [ ] Couleurs cohérentes
- [ ] Police lisible
- [ ] Icônes appropriées
- [ ] Espacement correct
- [ ] Hiérarchie visuelle claire

### Responsive
- [ ] Desktop (1920x1080) ✓
- [ ] Laptop (1366x768) ✓
- [ ] Tablette (768x1024) ✓
- [ ] Mobile (375x667) ✓
- [ ] Sidebar collapsible
- [ ] Tables scrollables

### Dark Mode
- [ ] Toggle dans header
- [ ] Thème sombre appliqué
- [ ] Contraste suffisant
- [ ] Couleurs adaptées
- [ ] Persistance du choix

### UX/UI
- [ ] Navigation intuitive
- [ ] Feedback utilisateur (toasts)
- [ ] Loading spinners
- [ ] Messages d'erreur clairs
- [ ] Confirmations pour actions critiques
- [ ] Animations fluides

---

## 🔧 Fonctionnalités Techniques

### Performance
- [ ] Chargement initial < 3s
- [ ] Navigation fluide
- [ ] Pas de freeze
- [ ] Images optimisées
- [ ] Code splitting actif

### Sécurité
- [ ] Mots de passe hashés (bcrypt)
- [ ] Tokens JWT sécurisés
- [ ] Validation côté serveur
- [ ] CORS configuré
- [ ] Inputs sanitizés
- [ ] Routes protégées

### API
- [ ] Toutes les routes fonctionnelles
- [ ] Codes HTTP corrects
- [ ] Messages d'erreur explicites
- [ ] Validation des données
- [ ] Gestion des erreurs

### Base de Données
- [ ] Collections créées automatiquement
- [ ] Admin par défaut créé
- [ ] Index configurés
- [ ] Requêtes optimisées
- [ ] Pas de données orphelines

---

## 📝 Collecte de Réponses

### Formulaire de Réponse
- [ ] Questions affichées dans l'ordre
- [ ] Champs requis validés
- [ ] Navigation précédent/suivant
- [ ] Barre de progression (si activée)
- [ ] Validation en temps réel
- [ ] Soumission fonctionne

### Types de Réponses
- [ ] Texte saisi correctement
- [ ] Email validé
- [ ] Téléphone validé
- [ ] NPS : sélection 0-10
- [ ] CSAT : sélection étoiles
- [ ] CES : sélection 1-7
- [ ] Choix multiple : radio buttons
- [ ] Checkbox : multi-sélection
- [ ] Date/heure : pickers natifs

### Géolocalisation
- [ ] Permission demandée
- [ ] Coordonnées capturées
- [ ] Stockées avec la réponse
- [ ] Affichées sur la carte

### Mode Hors-Ligne (Bonus)
- [ ] Détection de connectivité
- [ ] Stockage local
- [ ] Synchronisation auto
- [ ] Indicateur de statut

---

## 🧪 Tests Fonctionnels

### Scénario 1 : Admin crée un sondage
1. [ ] Login admin
2. [ ] Navigation vers création
3. [ ] Ajout de 5 questions différentes
4. [ ] Configuration paramètres
5. [ ] Activation
6. [ ] Vérification dans la liste

### Scénario 2 : Agent répond au sondage
1. [ ] Login agent
2. [ ] Voir sondage assigné
3. [ ] Répondre aux questions
4. [ ] Géolocalisation
5. [ ] Soumission
6. [ ] Confirmation

### Scénario 3 : Admin analyse
1. [ ] Ouverture analytics
2. [ ] Consultation NPS/CSAT
3. [ ] Vue carte
4. [ ] Filtres actifs
5. [ ] Export Excel
6. [ ] Vérification données

### Scénario 4 : Création d'utilisateur
1. [ ] Admin ouvre gestion utilisateurs
2. [ ] Création agent terrain
3. [ ] Assignation sondage
4. [ ] Login avec nouvel utilisateur
5. [ ] Vérification accès limité

---

## 📚 Documentation

- [ ] README.md complet
- [ ] QUICK_START.md clair
- [ ] FEATURES.md détaillé
- [ ] API_DEMO.http fonctionnel
- [ ] PRESENTATION.md structuré
- [ ] CONTRIBUTING.md utile
- [ ] Commentaires dans le code
- [ ] .env.example à jour

---

## 🚀 Préparation Soutenance

### Démonstration
- [ ] Scénarios de démo préparés
- [ ] Données de test créées
- [ ] Captures d'écran prêtes
- [ ] Temps chronométré (15-20 min)

### Technique
- [ ] Application déployée localement
- [ ] MongoDB running
- [ ] Pas d'erreurs console
- [ ] Performance fluide
- [ ] Dark mode testé

### Présentation
- [ ] Slides préparés (optionnel)
- [ ] Points clés notés
- [ ] Compétences listées
- [ ] Questions anticipées

### Backup
- [ ] Code sur clé USB
- [ ] Screenshots sauvegardés
- [ ] Vidéo démo (optionnel)
- [ ] Plan B si problème technique

---

## ⚠️ Points d'Attention

### Avant Démo
- [ ] Vider la base de données
- [ ] Créer données de démo cohérentes
- [ ] Tester tous les parcours
- [ ] Vérifier versions navigateurs
- [ ] Préparer MongoDB

### Pendant Démo
- [ ] Parler clairement
- [ ] Montrer le code si demandé
- [ ] Ne pas rester bloqué sur un bug
- [ ] Utiliser plan B si nécessaire
- [ ] Gérer le temps

### Après Démo
- [ ] Noter les questions
- [ ] Préparer améliorations
- [ ] Demander feedback
- [ ] Partager sur GitHub

---

## 🎯 Score Final Estimé

**Total des fonctionnalités implémentées :** __ / 100

- Authentification & Rôles : __ / 15
- Création Questionnaires : __ / 20
- Tableaux de Bord : __ / 15
- Analytics : __ / 15
- Cartographie : __ / 15
- Exports : __ / 10
- UX/UI : __ / 10

---

**Date de vérification :** _______________

**Signature :** _______________

**Prêt pour soutenance :** ☐ OUI ☐ NON

---

✨ **Bonne chance pour votre soutenance !** ✨