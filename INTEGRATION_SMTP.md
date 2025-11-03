# 📧 Intégration SMTP - Envoi d'Emails

## 📅 Date
3 novembre 2025

## 🎯 Objectif

Intégrer un serveur SMTP pour envoyer automatiquement des emails dans deux cas :
1. **Email de bienvenue** lors des nouvelles inscriptions
2. **Email de réinitialisation** pour le mot de passe oublié

---

## ✅ Fonctionnalités Implémentées

### 1. Service d'Envoi d'Emails

**Fichier** : `server/services/emailService.js`

**Fonctionnalités** :
- ✅ Configuration SMTP flexible via variables d'environnement
- ✅ Support Gmail, Outlook, et autres serveurs SMTP
- ✅ Mode développement (simulation si SMTP non configuré)
- ✅ Templates HTML professionnels
- ✅ Gestion d'erreurs robuste
- ✅ Logs informatifs

### 2. Templates d'Emails

#### Email de Bienvenue
- ✅ Design professionnel avec gradient
- ✅ Informations du compte (nom, email, statut)
- ✅ Instructions claires (prochaines étapes)
- ✅ Bouton "Se connecter" cliquable
- ✅ Responsive et compatible tous clients email

#### Email de Réinitialisation
- ✅ Design cohérent avec l'application
- ✅ Lien sécurisé avec token
- ✅ Information sur la durée de validité (10 min)
- ✅ Instructions de sécurité
- ✅ Bouton de réinitialisation cliquable
- ✅ Lien de secours si le bouton ne fonctionne pas

### 3. Routes Backend

#### POST /api/auth/register
- ✅ Envoie automatiquement un email de bienvenue après inscription
- ✅ Exécution asynchrone (non bloquante)
- ✅ Message mis à jour : "Un email de confirmation a été envoyé"

#### POST /api/auth/forgot-password
- ✅ Génère un token de réinitialisation sécurisé
- ✅ Envoie l'email avec le lien de réinitialisation
- ✅ Token valide pendant 10 minutes
- ✅ Protection contre l'énumération d'emails

#### POST /api/auth/reset-password
- ✅ Vérifie le token et son expiration
- ✅ Réinitialise le mot de passe
- ✅ Efface le token après utilisation
- ✅ Messages d'erreur clairs en français

### 4. Page Frontend

**Fichier** : `src/pages/auth/ResetPassword.tsx`

**Fonctionnalités** :
- ✅ Récupère le token depuis l'URL
- ✅ Formulaire de nouveau mot de passe
- ✅ Confirmation de mot de passe
- ✅ Affichage/masquage du mot de passe
- ✅ Validation côté client
- ✅ Message de succès avec redirection automatique
- ✅ Design cohérent avec les autres pages d'auth

---

## 🔧 Configuration SMTP

### Variables d'Environnement Requises

Créez ou modifiez le fichier `.env` dans le dossier `server` :

```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# URL du client (pour les liens dans les emails)
CLIENT_URL=http://localhost:5173
```

### Configuration Gmail

1. **Activer l'authentification à deux facteurs** sur votre compte Gmail

2. **Créer un mot de passe d'application** :
   - Aller sur https://myaccount.google.com/apppasswords
   - Sélectionner "Autre (nom personnalisé)"
   - Entrer "G-Survey"
   - Cliquer "Générer"
   - **Copier le mot de passe** (16 caractères)

3. **Configurer le .env** :
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=ygouhean@gmail.com
   SMTP_PASS=tspd pcza wwbc qrnt
  # Le mot de passe d'application
   ```

### Configuration Outlook/Hotmail

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
```

### Configuration SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
```

### Configuration Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.com
SMTP_PASS=votre-api-key-mailgun
```

### Configuration Personnalisée

```env
SMTP_HOST=votre-serveur-smtp.com
SMTP_PORT=587
SMTP_SECURE=false  # true pour port 465
SMTP_USER=votre-email@domaine.com
SMTP_PASS=votre-mot-de-passe
```

---

## 📦 Installation

### 1. Installer Nodemailer

```bash
npm install
```

Cela installera automatiquement `nodemailer` (déjà ajouté dans `package.json`).

### 2. Appliquer la Migration de Base de Données

#### Windows (PowerShell)
```powershell
cd scripts
.\add-reset-password-fields.ps1
```

#### Linux/Mac (Bash)
```bash
cd scripts
chmod +x add-reset-password-fields.sh
./add-reset-password-fields.sh
```

### 3. Configurer les Variables d'Environnement

Créez un fichier `.env` dans `server/` :

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# Client URL
CLIENT_URL=http://localhost:5173

# Autres variables existantes
JWT_SECRET=votre-secret-jwt
DB_HOST=localhost
DB_PORT=5432
# etc.
```

### 4. Redémarrer le Serveur

```bash
cd server
npm start
```

---

## 🧪 Tests

### Test 1 : Email de Bienvenue

1. **Aller sur** http://localhost:5173/register

2. **Créer un nouveau compte** :
   ```
   Nom: Test
   Prénoms: Email
   Email: test-email@example.com
   Mot de passe: Test@123
   ```

3. **Vérifier** :
   - ✅ Inscription réussie
   - ✅ Message : "Un email de confirmation a été envoyé"
   - ✅ Email reçu dans la boîte de réception (ou spam)
   - ✅ Email contient les informations du compte
   - ✅ Bouton "Se connecter" fonctionne

### Test 2 : Email de Réinitialisation

1. **Aller sur** http://localhost:5173/forgot-password

2. **Entrer un email existant** :
   ```
   Email: admin@gsurvey.com
   ```

3. **Cliquer** "Envoyer le lien de réinitialisation"

4. **Vérifier** :
   - ✅ Message : "Vous recevrez un lien..."
   - ✅ Email reçu dans la boîte de réception
   - ✅ Lien de réinitialisation présent
   - ✅ Email indique 10 minutes de validité

5. **Cliquer sur le lien dans l'email**

6. **Vérifier** :
   - ✅ Redirection vers `/reset-password?token=...`
   - ✅ Formulaire de nouveau mot de passe visible
   - ✅ Token présent dans l'URL

7. **Remplir le formulaire** :
   ```
   Nouveau mot de passe: Nouveau@123
   Confirmer: Nouveau@123
   ```

8. **Cliquer** "Réinitialiser le mot de passe"

9. **Vérifier** :
   - ✅ Message de succès
   - ✅ Redirection vers `/login` après 3 secondes
   - ✅ Connexion possible avec le nouveau mot de passe

### Test 3 : Token Expiré

1. **Demander une réinitialisation**

2. **Attendre 11 minutes** (ou modifier l'expiration dans le code)

3. **Essayer de réinitialiser**

4. **Vérifier** :
   - ✅ Message : "Token invalide ou expiré"
   - ✅ Proposition de demander un nouveau lien

---

## 🔒 Sécurité

### Tokens de Réinitialisation

**Caractéristiques** :
- ✅ Token aléatoire de 32 bytes (256 bits)
- ✅ Hashé avec SHA-256 avant stockage
- ✅ Expiration de 10 minutes
- ✅ Effacé après utilisation
- ✅ Un seul token valide à la fois

**Protection** :
- ✅ Token jamais exposé dans les logs
- ✅ Hash stocké en base (pas le token brut)
- ✅ Comparaison sécurisée (hash vs hash)
- ✅ Protection contre les attaques par force brute

### Protection Email Enumeration

**Implémentation** :
- ✅ Réponse identique si email existe ou non
- ✅ Email envoyé uniquement si compte existe
- ✅ Délai avant réponse (même si pas d'email)

### HTTPS Recommandé

**En production** :
- ✅ Utiliser HTTPS pour protéger les tokens dans l'URL
- ✅ Cookies sécurisés pour les sessions
- ✅ Validation stricte des tokens

---

## 📊 Structure des Emails

### Email de Bienvenue

```
┌─────────────────────────────────────────┐
│  [Header Gradient Bleu/Violet]          │
│  📍 G-Survey                            │
├─────────────────────────────────────────┤
│                                         │
│  Bienvenue [Prénom] ! 👋               │
│                                         │
│  Votre compte a été créé avec succès    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📋 Informations de votre compte : │ │
│  │                                    │ │
│  │ Nom : [Prénom] [Nom]              │ │
│  │ Email : [email]                   │ │
│  │ Statut : Agent de terrain         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🎯 Prochaines étapes :            │ │
│  │                                    │ │
│  │ 1. Contacter admin/superviseur   │ │
│  │ 2. Attendre assignation équipe    │ │
│  │ 3. Commencer collecte données     │ │
│  │ 4. Compléter profil               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Bouton : Se connecter maintenant →] │
│                                         │
└─────────────────────────────────────────┘
```

### Email de Réinitialisation

```
┌─────────────────────────────────────────┐
│  [Header Gradient Bleu/Violet]          │
│  🔐 Réinitialisation                    │
├─────────────────────────────────────────┤
│                                         │
│  Bonjour [Prénom],                      │
│                                         │
│  Vous avez demandé la réinitialisation  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ⏰ Attention :                     │ │
│  │ Ce lien est valide 10 minutes      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Bouton : Réinitialiser mot de passe] │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 💡 Lien de secours :               │ │
│  │ [URL complète]                      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ⚠️ Sécurité :                      │ │
│  │ Si vous n'avez pas demandé...      │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🐛 Dépannage

### Email Non Reçu

**Vérifications** :

1. **Config SMTP correcte** :
   - Vérifier `.env` dans `server/`
   - Vérifier les logs du serveur

2. **Dossier Spam** :
   - Vérifier le dossier spam/courrier indésirable
   - Ajouter l'expéditeur aux contacts

3. **Logs du serveur** :
   ```
   ✅ Email envoyé avec succès: { to: '...', messageId: '...' }
   ```

4. **Erreurs dans les logs** :
   ```
   ❌ Erreur lors de l'envoi de l'email: [détails]
   ```

### Erreur "SMTP_USER non configuré"

**Solution** :
- Ajouter les variables SMTP dans `.env`
- Redémarrer le serveur

### Erreur "Invalid login credentials"

**Pour Gmail** :
- Utiliser un mot de passe d'application (pas le mot de passe normal)
- Activer l'authentification à deux facteurs

**Pour autres services** :
- Vérifier username et mot de passe
- Vérifier que le compte SMTP est activé

### Token Expiré

**Solution** :
- Demander un nouveau lien de réinitialisation
- Le nouveau token remplace l'ancien

### Le Lien Ne Fonctionne Pas

**Vérifications** :
1. URL complète : `http://localhost:5173/reset-password?token=...`
2. Token présent dans l'URL
3. Token pas encore expiré
4. Token pas déjà utilisé

---

## 📈 Améliorations Futures

### Court Terme
1. Email de confirmation de changement de mot de passe réussi
2. Email de notification de nouvelle connexion
3. Template email pour notifications d'équipe

### Moyen Terme
1. Support plusieurs langues (EN, FR, ES)
2. Personnalisation des templates (admin)
3. Statistiques d'envoi d'emails

### Long Terme
1. Queue d'emails (Bull/Redis)
2. Templates dynamiques depuis base de données
3. Service d'emails tiers (SendGrid, Mailgun) intégré
4. Tracking d'ouverture des emails

---

## 📝 Fichiers Modifiés/Créés

### Backend (6 fichiers)

1. **server/services/emailService.js** (créé)
   - Service complet d'envoi d'emails
   - Templates HTML
   - ~400 lignes

2. **server/models/User.js** (modifié)
   - Ajout `resetPasswordToken`
   - Ajout `resetPasswordExpire`

3. **server/routes/auth.js** (modifié)
   - Import emailService
   - Intégration email bienvenue
   - Implémentation forgot-password
   - Nouvelle route reset-password

4. **server/migrations/add-reset-password-fields.sql** (créé)
   - Migration pour nouveaux champs

5. **scripts/add-reset-password-fields.ps1** (créé)
   - Script Windows

6. **scripts/add-reset-password-fields.sh** (créé)
   - Script Linux/Mac

### Frontend (2 fichiers)

1. **src/pages/auth/ResetPassword.tsx** (créé)
   - Page complète de réinitialisation
   - ~200 lignes

2. **src/App.tsx** (modifié)
   - Ajout route `/reset-password`

### Package (1 fichier)

1. **package.json** (modifié)
   - Ajout `nodemailer` dans dependencies

---

## ✅ Checklist de Déploiement

- [ ] Installer nodemailer : `npm install`
- [ ] Appliquer la migration SQL
- [ ] Configurer les variables SMTP dans `.env`
- [ ] Tester l'envoi d'email de bienvenue
- [ ] Tester l'envoi d'email de réinitialisation
- [ ] Tester la réinitialisation de mot de passe
- [ ] Vérifier les logs d'erreur
- [ ] Configurer HTTPS en production
- [ ] Tester avec différents clients email (Gmail, Outlook, etc.)

---

**Date de finalisation** : 3 novembre 2025  
**Version** : 2.5.0  
**Statut** : ✅ Complet et fonctionnel

**Le système d'envoi d'emails est maintenant opérationnel ! 📧✨**


