# Pages d'Accueil et d'Authentification - G-Survey

## 📋 Vue d'ensemble

Ce document décrit les nouvelles pages d'accueil et d'authentification créées pour l'application G-Survey, offrant une expérience utilisateur professionnelle et moderne.

## 🎯 Fonctionnalités Ajoutées

### 1. Page d'Accueil (Landing Page) 🏠

**Fichier:** `src/pages/Landing.tsx`  
**Route:** `/`

Une page d'accueil professionnelle avec :

#### Composants Principaux :
- **Navigation Header**
  - Logo G-Survey avec icône
  - Boutons "Se connecter" et "S'inscrire"
  - Design responsive

- **Section Hero**
  - Titre accrocheur et description
  - Boutons d'action (Commencer gratuitement, Démo)
  - Carte de démonstration avec icônes

- **Section Statistiques**
  - 500+ Agents de Terrain
  - 10k+ Points Collectés
  - 98% Satisfaction Client
  - Support 24/7

- **Section Fonctionnalités**
  - 6 fonctionnalités principales présentées avec icônes
  - Géolocalisation, Gestion d'équipes, Analyses, etc.

- **Section Témoignages**
  - 3 témoignages clients avec notes 5 étoiles

- **Section Call-to-Action**
  - Invitation à créer un compte gratuit

- **Footer Professionnel**
  - Liens vers produits, entreprise, et mentions légales
  - Copyright

### 2. Page d'Inscription 📝

**Fichier:** `src/pages/auth/Register.tsx`  
**Route:** `/register`

Formulaire complet d'inscription avec :

#### Champs du Formulaire :
- **Informations Personnelles**
  - Nom * (requis)
  - Prénoms * (requis)
  - Genre (optionnel) : Homme, Femme, Autre
  - Nom d'utilisateur * (requis)

- **Informations de Compte**
  - Email * (requis, validé)
  - Mot de passe * (minimum 8 caractères)
  - Confirmer mot de passe *
  - Boutons pour afficher/masquer les mots de passe

- **Informations Professionnelles**
  - Pays (liste de 50+ pays)
  - Secteur d'activité (14 secteurs disponibles)
  - Type d'organisation (9 types disponibles)

- **Conditions**
  - Case à cocher pour accepter les conditions d'utilisation et la politique de confidentialité *
  - Liens vers les pages légales

#### Fonctionnalités :
- Validation en temps réel
- Messages d'erreur clairs
- Image de fond professionnelle
- Auto-connexion après inscription réussie
- Redirection automatique vers le dashboard
- Design responsive

### 3. Page de Connexion Améliorée 🔐

**Fichier:** `src/pages/auth/Login.tsx`  
**Route:** `/login`

Page de connexion améliorée avec :

#### Améliorations :
- Image de fond professionnelle avec overlay
- Champ unique : "Nom d'utilisateur ou Email"
- Lien "Mot de passe oublié ?"
- Lien vers la page d'inscription
- Liens vers conditions d'utilisation et politique de confidentialité
- Conservation des identifiants de démonstration
- Design moderne et responsive

### 4. Page Mot de Passe Oublié 🔄

**Fichier:** `src/pages/auth/ForgotPassword.tsx`  
**Route:** `/forgot-password`

Page de récupération de mot de passe avec :

#### Fonctionnalités :
- Formulaire simple avec champ email
- Image de fond professionnelle
- Message de succès avec icône
- Instructions claires
- Rappel de vérifier le spam
- Bouton retour vers la connexion
- Validation d'email
- Design responsive

### 5. Pages Légales 📄

#### Conditions d'Utilisation
**Fichier:** `src/pages/Terms.tsx`  
**Route:** `/terms`

Contenu complet incluant :
- Acceptation des conditions
- Description du service
- Compte utilisateur
- Utilisation acceptable
- Propriété intellectuelle
- Protection des données
- Limitation de responsabilité
- Modification des conditions
- Résiliation
- Droit applicable
- Contact

#### Politique de Confidentialité
**Fichier:** `src/pages/Privacy.tsx`  
**Route:** `/privacy`

Contenu complet incluant :
- Introduction
- Données collectées (inscription, sondage, utilisation)
- Utilisation des données
- Partage des données
- Sécurité des données
- Conservation des données
- Droits des utilisateurs (RGPD)
- Cookies et technologies
- Transferts internationaux
- Modifications de la politique
- Contact et DPO

## 🔧 Modifications Backend

### Fichier: `server/routes/auth.js`

#### Nouvelle Route d'Inscription Publique
```javascript
POST /api/auth/register
```
- Accessible publiquement (sans authentification)
- Validation des champs (email, mot de passe min 8 caractères, etc.)
- Création d'utilisateur avec rôle "supervisor" par défaut
- Génération automatique de token JWT
- Auto-login après inscription

#### Route Séparée pour Création d'Utilisateurs par Admin
```javascript
POST /api/auth/create-user
```
- Accessible uniquement aux admins
- Pour créer des membres d'équipe
- Permet de spécifier le rôle et l'équipe

#### Nouvelle Route de Récupération de Mot de Passe
```javascript
POST /api/auth/forgot-password
```
- Accessible publiquement
- Validation d'email
- Retour de succès dans tous les cas (sécurité)
- TODO: Implémentation de l'envoi d'email réel

## 🛣️ Routes Mises à Jour

### Fichier: `src/App.tsx`

#### Routes Publiques :
- `/` - Landing page (redirige vers dashboard si connecté)
- `/terms` - Conditions d'utilisation
- `/privacy` - Politique de confidentialité

#### Routes d'Authentification :
- `/login` - Connexion
- `/register` - Inscription
- `/forgot-password` - Récupération de mot de passe

#### Routes Protégées :
- `/dashboard` - Tableau de bord
- `/surveys/*` - Gestion des sondages
- `/map` - Vue carte
- `/analytics` - Analyses
- `/users` - Gestion utilisateurs (admin)
- `/settings` - Paramètres

### Fichier: `src/layouts/AuthLayout.tsx`

Simplifié pour permettre aux pages d'authentification de gérer leur propre style :
- Pas de wrapper avec fond
- Redirection automatique vers dashboard si déjà connecté
- Affichage direct des pages enfants

## 🎨 Design et UX

### Caractéristiques Visuelles :
- **Images de fond** : Photos professionnelles d'Unsplash
- **Overlays** : Dégradés de couleur primary pour la lisibilité
- **Icônes** : Lucide React pour cohérence visuelle
- **Responsive** : Adaptation mobile, tablette, desktop
- **Mode sombre** : Support complet avec Tailwind dark mode
- **Animations** : Transitions fluides sur les interactions

### Palette de Couleurs :
- Primary : Tons de bleu/primary définis dans le thème
- Succès : Vert pour les messages positifs
- Erreur : Rouge pour les alertes
- Neutre : Gris pour le texte secondaire

## 📱 Responsive Design

Toutes les pages sont entièrement responsive avec :
- **Mobile** : Layout en colonne, navigation compacte
- **Tablette** : Grilles à 2 colonnes
- **Desktop** : Grilles à 3-4 colonnes, espacement généreux

## 🔒 Sécurité

### Mesures Implémentées :
- Validation côté client et serveur
- Mots de passe hachés avec bcrypt
- Tokens JWT pour l'authentification
- Protection contre l'énumération d'emails (forgot password)
- Validation d'email avec regex
- Minimum 8 caractères pour les mots de passe
- HTTPS requis en production

## 🚀 Pour Commencer

### Installation :
Les dépendances sont déjà installées. Aucune nouvelle dépendance n'a été ajoutée.

### Lancement :
```bash
# Frontend (depuis la racine)
npm run dev

# Backend (depuis la racine, dans un autre terminal)
cd server
npm start
```

### Accès :
- Page d'accueil : http://localhost:5173/
- Inscription : http://localhost:5173/register
- Connexion : http://localhost:5173/login

## 📝 Notes de Développement

### Images de Fond :
Les URLs d'images utilisent Unsplash. En production, considérez :
- Héberger les images localement
- Utiliser un CDN
- Optimiser les images pour la performance

### Envoi d'Emails :
La fonctionnalité "mot de passe oublié" nécessite :
- Configuration d'un service d'email (SendGrid, AWS SES, etc.)
- Variables d'environnement pour les credentials
- Templates d'email HTML

### Champs Additionnels :
Les champs suivants sont collectés mais non stockés actuellement :
- Genre
- Pays
- Secteur d'activité
- Type d'organisation

Pour les stocker, il faut :
1. Ajouter les colonnes dans le modèle User (Sequelize)
2. Créer une migration de base de données
3. Mettre à jour les routes backend

## 🔄 Améliorations Futures

### Court Terme :
- [ ] Implémenter l'envoi d'emails réels
- [ ] Ajouter les champs supplémentaires au modèle User
- [ ] Ajouter une page de vérification d'email
- [ ] Implémenter la page de réinitialisation de mot de passe

### Moyen Terme :
- [ ] Ajouter l'authentification OAuth (Google, Microsoft)
- [ ] Implémenter l'authentification à deux facteurs (2FA)
- [ ] Créer un onboarding pour nouveaux utilisateurs
- [ ] Ajouter des animations et micro-interactions

### Long Terme :
- [ ] Système de gamification
- [ ] Intégration avec des CRM
- [ ] API publique avec documentation
- [ ] Application mobile native

## 📞 Support

Pour toute question ou problème :
- **Email** : contact@gsurvey.com
- **Documentation** : Voir les fichiers .md dans le projet
- **Issues** : Créer une issue GitHub

---

**Date de création** : 2 novembre 2025  
**Dernière mise à jour** : 2 novembre 2025  
**Version** : 1.0.0


